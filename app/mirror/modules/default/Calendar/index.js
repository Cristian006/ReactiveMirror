// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import validUrl from 'valid-url';
import request from 'request';
import ical from 'ical';
import notifications from '../../../core/notifications';
import { isFullDayEvent } from './core/utils';

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
    moment.updateLocale(this.props.language, this.getLocaleSpecification(this.props.timeFormat));

    this.setState({
      calendars: this.props.calendars.map((cal) => {
        return {
          ...cal,
          url: cal.url.replace('webcal://', 'http://'),
          excludedEvents: calendarConfig.excludedEvents || this.props.excludedEvents,
          maximumEntries: calendarConfig.maximumEntries || this.props.maximumEntries,
          maximumNumberOfDays: calendarConfig.maximumNumberOfDays || this.props.maximumNumberOfDays,
        };
      }),
      loaded: false,
      calendarData: {},
      intervalId: setInterval(() => {
        this.updateModule();
      }, this.props.updateInterval)
    });

    this.updateModule();

    notifications.on('CALENDAR_NOTIFICATION', (arg) => {
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
    if (!this.state.loaded) {
      this.hideShowModule(true, () => {
        this.fetchCalendarItems();
        this.hideShowModule(false);
      });
    } else {
      this.fetchCalendarItems();
    }
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

  fetchCalendarItems() {
    const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
    this.state.calendars.forEach(calendar => {
      if (!validUrl.isUri(calendar.url)) {
        notifications.emit('CALENDAR_NOTIFICATION', {
          type: 'INCORRECT_URL',
          payload: {
            url: calendar.url,
            error: 'incorrect url!'
          }
        });
        return;
      }

      const opts = {
        headers: {
          'User-Agent': `Mozilla/5.0 (Node.js ${nodeVersion}) MagicMirror/${process.env.MIRROR_VERSION} (https://github.com/cristian006/ReactiveMirror/)`
        }
      };

      if (calendar.auth) {
        if (calendar.auth.method === 'bearer') {
          opts.auth = {
            bearer: calendar.auth.pass
          };
        } else {
          opts.auth = {
            user: calendar.auth.user,
            pass: calendar.auth.pass
          };
  
          opts.auth.sendImmediately = calendar.auth.method !== 'digest';
        }
      }
      
      ical.fromURL(calendar.url, opts, (err, data) => {
        if (err) {
          console.log('error getting calendar!');
          notifications.emit('CALENDAR_NOTIFICATION', {
            type: 'FETCH_ERROR',
            payload: {
              url: calendar.url,
              error: 'error getting calendar!'
            }
          });
          return;
        }

        let newEvents = [];

        let limitFunction = (date, i) => {
          return i < this.props.maximumEntries;
        };

        let eventDate = (event, time) => {
          return event[time].length === 8 ? moment(event[time], 'YYYYMMDD') : moment(new Date(event[time]));
        };

        for (var e in data) {
          var event = data[e];
          var now = new Date();
          var today = moment().startOf("day").toDate();
          var future = moment().startOf("day").add(this.props.maximumNumberOfDays, "days").subtract(1,"seconds").toDate(); // Subtract 1 second so that events that start on the middle of the night will not repeat.
  
          // FIXME:
          // Ugly fix to solve the facebook birthday issue.
          // Otherwise, the recurring events only show the birthday for next year.
          var isFacebookBirthday = false;
          if (typeof event.uid !== "undefined") {
            if (event.uid.indexOf("@facebook.com") !== -1) {
              isFacebookBirthday = true;
            }
          }
  
          if (event.type === "VEVENT") {
  
            var startDate = eventDate(event, "start");
            var endDate;
            if (typeof event.end !== "undefined") {
              endDate = eventDate(event, "end");
            } else {
              if (!isFacebookBirthday) {
                endDate = startDate;
              } else {
                endDate = moment(startDate).add(1, "days");
              }
            }
            // calculate the duration f the event for use with recurring events.
            var duration = parseInt(endDate.format("x")) - parseInt(startDate.format("x"));
  
            if (event.start.length === 8) {
              startDate = startDate.startOf("day");
            }
  
            var Title = "Event";
            if (event.summary) {
              Title = (typeof event.summary.val !== "undefined") ? event.summary.val : event.summary;
            } else if(event.description) {
              Title = event.description;
            }
  
            var excluded = false;
            for (var f in this.props.excludedEvents) {
              var filter = this.props.excludedEvents[f];
              if (Title.toLowerCase().includes(filter.toLowerCase())) {
                excluded = true;
                break;
              }
            }
  
            if (excluded) {
              continue;
            }
  
            var location = event.location || false;
            var geo = event.geo || false;
            var description = event.description || false;
  
            if (typeof event.rrule != "undefined" && !isFacebookBirthday) {
              var rule = event.rrule;
              var dates = rule.between(today, future, true, limitFunction);
  
              for (var d in dates) {
                startDate = moment(new Date(dates[d]));
                endDate = moment(parseInt(startDate.format("x")) + duration, "x");
                if (endDate.format("x") > now) {
                  newEvents.push({
                    title: Title,
                    startDate: startDate.format("x"),
                    endDate: endDate.format("x"),
                    fullDayEvent: isFullDayEvent(event),
                    class: event.class,
                    firstYear: event.start.getFullYear(),
                    location: location,
                    geo: geo,
                    description: description
                  });
                }
              }
            } else {
              // console.log("Single event ...");
              // Single event.
              var fullDayEvent = (isFacebookBirthday) ? true : isFullDayEvent(event);
  
              if (!fullDayEvent && endDate < new Date()) {
                //console.log("It's not a fullday event, and it is in the past. So skip: " + title);
                continue;
              }
  
              if (fullDayEvent && endDate <= today) {
                //console.log("It's a fullday event, and it is before today. So skip: " + title);
                continue;
              }
  
              if (startDate > future) {
                //console.log("It exceeds the maximumNumberOfDays limit. So skip: " + title);
                continue;
              }
  
              // Every thing is good. Add it to the list.
  
              newEvents.push({
                title: Title,
                startDate: startDate.format("x"),
                endDate: endDate.format("x"),
                fullDayEvent: fullDayEvent,
                class: event.class,
                location: location,
                geo: geo,
                description: description
              });
            }
          }
        }

        newEvents.sort((a, b) => {
          return a.startDate - b.startDate;
        });

        notifications.emit('CALENDAR_NOTIFICATION', {
          type: 'CALENDAR_EVENTS',
          payload: {
            url: calendar.url,
            events: newEvents.slice(0, this.props.maximumEntries)
          }
        });
      });
    });
  }

  hasCalendarURL(url) {
    return this.state.calendars.some((cal) => cal.url === url);
  }

  symbolsForUrl(url) {
    return this.getCalendarProperty(url, 'symbol', this.props.defaultSymbol);
  }
  
  colorForUrl(url) {
    return this.getCalendarProperty(url, 'color', '#fff');
  }

  countTitleForUrl(url) {
    return this.getCalendarProperty(url, 'repeatingCountTitle', this.props.defaultRepeatingCountTitle);
  }

  getLocaleSpecification(timeFormat) {
    switch (timeFormat) {
      case 12:
        return { longDateFormat: { LT: 'h:mm A' } };
      case 24:
        return { longDateFormat: { LT: 'HH:mm' } };
      default:
        return { longDateFormat: { LT: moment.localeData().longDateFormat('LT') } };
    }
  }

  getCalendarProperty(url, property, defaultValue) {
    for (let c in this.state.calendars) {
      let calendars = this.state.calendars[c];
      if (calendar.url === url && calendar.hasOwnProperty(property)) {
        return calendar[property];
      }
    }
    return defaultValue;
  }

  createEventList() {
    let events = [];
    let today = moment().startOf('day');
    for (let c in this.state.calendarData) {
      let calendar = this.state.calendarData[c];
      for (var e in calendar) {
        let event = calendar[e];
        if (this.props.hidePrivate) {
          if (event.class === 'PRIVATE') {
              // do not add the current event, skip it
            continue;
          }
        }
        event.url = c;
        event.today = event.startDate >= today && event.startDate < (today + 24 * 60 * 60 * 1000);
        events.push(event);
      }
    }

    events.sort((a, b) => {
      return a.startDate - b.startDate;
    });

    return events;
  }

  broadcastEvents() {
    const eventList = [];
    for (let url in this.state.calendarData) {
      const calendar = this.state.calendarData[url];
      for (let e in calendar) {
        const event = {
          ...calendar[e],
          symbol: this.symbolsForUrl(url),
          color: this.colorForUrl(url)
        };
        delete event.url;
        eventList.push(event);
      }
    }

    eventList.sort((a, b) => a.startDate - b.startDate);

    notifications.emit('NOTIFICATION', { type: 'CALENDAR_EVENTS', payload: eventList });
  }

  generateDOM(events) {
    return events.map((event) => {
      const SymbolComponent = () => {
        let symbols = [...this.symbolsForUrl(event.url)];
        return (
          <td className="symbol aligh-right">
            {symbols.map((symbol, indx) => {
              return (
                <span className={`fa fa-${symbol}`} style={{paddingLeft: indx > 0 ? '5px' : '' }} />
              );
            })}
          </td>
        );
      };
      return (
        <tr className="normal" style={this.props.colored ? { color: this.colorForUrl(event.url) } : {}}>
          {
            this.props.displaySymbol &&
            <SymbolComponent />
          }
        </tr>
      );
    });
  }

  render() {
    let events = this.createEventList();
    if (events.length === 0) {
      return <table className="small dimmed">{(this.state.loaded) ? 'EMPTY' : 'LOADING'}</table>;
    }

    return (
      <table className="small">
        <tbody>
          {this.generateDOM(events)}
        </tbody>
      </table>
    );
  }
}

Calendar.moduleName = 'Calendar';

Calendar.defaultProps = {
  fadeSpeed: 4000,
  updateInterval: 5 * 60 * 1000, // update the module to change the current item every 30 seconds
  animation: 'ease-in',
  maximumEntries: 10, // Total Maximum Entries
  maximumNumberOfDays: 365,
  displaySymbol: true,
  defaultSymbol: 'calendar', // Fontawesome Symbol see http://fontawesome.io/cheatsheet/
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
