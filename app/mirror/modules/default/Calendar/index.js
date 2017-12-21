// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import validUrl from 'valid-url';
import request from 'request';
import notifications from '../../../core/notifications';
import { getLocaleSpecification } from './core/utils';
import ical from 'ical';

class Calendar extends Component {

  constructor(props: any) {
    super(props);
    this.updateModule = this.updateModule.bind(this);
    this.hideShowModule = this.hideShowModule.bind(this);
    this.hasCalendarURL = this.hasCalendarURL.bind(this);
  }

  state = {
    opacity: 0,
    hidden: true,
    intervalId: null,
    refreshId: null,
    showHideTimer: null,
    newsItems: [],
    loaded: false,
    activeItem: -1,
  };

  componentDidMount() {
    moment.updateLocale(this.props.language, getLocaleSpecification(this.props.timeFormat));

    this.setState({
      calendars: this.props.calendars.map((cal) => {
        return {
          ...cal,
          url: cal.url.replace('webcal://', 'http://'),
          excludedEvents: calendarConfig.excludedEvents || this.props.excludedEvents,
          maximumEntries: calendarConfig.maximumEntries || this.props.maximumEntries,
          maximumNumberOfDays: calendarConfig.maximumNumberOfDays || this.props.maximumNumberOfDays,
          fetchInterval: this.props.fetchInterval
        };
      }),
      loaded: false,
      calendarData: {},
      intervalId: setInterval(() => {
        this.updateModule();
      }, this.props.updateInterval)
    });

    this.updateModule();

    notifications.on('NOTIFICATION', (arg) => {
      switch (arg.type) {
        case 'CALENDAR_EVENTS':
          if (this.hasCalendarURL(arg.payload.url)) {

            this.setState({
              calendarData: { ...this.state.calendarData, [arg.payload.url]: arg.payload.events },
              loaded: true
            });
    
            if (this.props.broadcastEvents) {
              this.broadcastEvents();
            }
          }
          break;
        case 'FETCH_ERROR':
          console.log('Calendar Error. Could not fetch calendar: ' + arg.payload.url);
          break;
        case 'INCORRECT_URL':
          console.log('Calendar Error. Could not fetch calendar: ' + arg.payload.url);
          break;
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    clearTimeout(this.state.showHideTimer);
  }

  updateModule() {
    this.hideShowModule(true, () => {
      this.updateWeather((data) => {
        if (data.error) {
          console.log(data.error);
          return;
        }
        this.setState({
          ...processWeather(data),
        }, () => {
          this.hideShowModule(false);
        });
      });
    });
  }

  hideShowModule(hide: boolean, callback: any) {
    this.setState({
      opacity: hide ? 0 : 1,
      hidden: hide
    });
    if (hide && callback) {
      this.setState({
        showHideTimer: setTimeout(() => { callback(); }, this.props.fadeSpeed / 2),
      });
    } else {
      clearTimeout(this.state.showHideTimer);
    }
  }

  fetchCalendarItems(callback) {
    if (!validUrl.isUri(url)) {
      console.log('There is no api Key');
      return;
    }

		const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
    this.state.calendars.forEach(calendar => {
      
      let opts = {
        headers: {
          'User-Agent': `Mozilla/5.0 (Node.js ${nodeVersion}) MagicMirror/${process.env.MIRROR_VERSION} (https://github.com/cristian006/ReactiveMirror/)`
        }
      };

      if (calendar.auth) {
        if (calendar.auth.method === 'bearer') {
          opts.auth = {
            bearer: calendar.auth.pass
          }
  
        } else {
          opts.auth = {
            user: calendar.auth.user,
            pass: calendar.auth.pass
          };
  
          opts.auth.sendImmediately = calednar.auth.method !== 'digest';
        }
      }
      
      ical.fromURL(calendar.url, opts, (err, data) => {
        if (err) {
          console.log('error getting calendar!');
          return;
        }
        let newEvents = [];

        let limitFunction = (date, i) => {
          return i < maximumEntries;
        }

        let eventDate = (event, time) => {
          return event[time].length === 8 ? moment(event[time], 'YYYYMMDD') : moment(new Date(event[time]));
        }

        console.log(data);
      });
    });
  }

  hasCalendarURL(url) {
    return this.state.calendars.some((cal) => cal.url === url);
  }

  createEventList() {
		var events = [];
		var today = moment().startOf("day");
		for (var c in this.state.calendarData) {
			var calendar = this.state.calendarData[c];
			for (var e in calendar) {
				var event = calendar[e];
				if(this.props.hidePrivate) {
					if(event.class === "PRIVATE") {
						  // do not add the current event, skip it
						  continue;
					}
				}
				event.url = c;
				event.today = event.startDate >= today && event.startDate < (today + 24 * 60 * 60 * 1000);
				events.push(event);
			}
		}

		events.sort(function (a, b) {
			return a.startDate - b.startDate;
		});

		return events;
  }

  generateDOM() {
    if (this.props.displaySymbol) {
      
    }
  }

  render() {
    let events = this.createEventList();
    if(events.length === 0) {
      return <table className="small dimmed">{(this.state.loaded) ? 'EMPTY' : 'LOADING'}</table>
    }

    return(
      <table className="small">
        {this.generateDOM()}   
      </table>
    );
  }
}

Calendar.moduleName = 'Calendar';

Calendar.defaultProps = {
  fadeSpeed: 4000,
  updateInterval: 30000, // update the module to change the current item every 30 seconds
  animation: 'ease-in',
  maximumEntries: 10, // Total Maximum Entries
  maximumNumberOfDays: 365,
  displaySymbol: true,
  defaultSymbol: "calendar", // Fontawesome Symbol see http://fontawesome.io/cheatsheet/
  displayRepeatingCountTitle: false,
  defaultRepeatingCountTitle: "",
  maxTitleLength: 25,
  wrapEvents: false, // wrap events to multiple lines breaking at maxTitleLength
  fade: true,
  urgency: 7,
  timeFormat: "relative",
  dateFormat: "MMM Do",
  fullDayEventDateFormat: "MMM Do",
  getRelative: 6,
  fadePoint: 0.25, // Start on 1/4th of the list.
  hidePrivate: false,
  colored: true,
  calendars: [
    {
      symbol: "calendar",
      url: "http://www.calendarlabs.com/templates/ical/US-Holidays.ics",
    },
  ],
  titleReplace: {
    "De verjaardag van ": "",
    "'s birthday": ""
  },
  broadcastEvents: true,
  excludedEvents: []
};

Calendar.propTypes = {
  fadeSpeed: PropTypes.number,
  updateInterval: PropTypes.number,
  animation: PropTypes.string,
};

export default Calendar;
