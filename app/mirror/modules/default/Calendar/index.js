// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import request from 'request';
import notifications from '../../../core/notifications';
import { getLocaleSpecification } from './core/utils';

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
      calendarData: {}
    });
/*
    this.updateModule();
    this.setState({
      intervalId: setInterval(() => {
        this.updateModule();
      }, this.props.updateInterval)
    });
*/
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

  hasCalendarURL(url) {
    return this.state.calendars.some((cal) => cal.url === url);
  }

  addCalednar(_url, _auth, calendarConfig) {
    notifications.emit('NOTIFICATION', {
      type: 'ADD_CALENDAR',
      payload: {
        url: _url,
        auth: _auth,
        excludedEvents: calendarConfig.excludedEvents || this.props.excludedEvents,
        maximumEntries: calendarConfig.maximumEntries || this.props.maximumEntries,
        maximumNumberOfDays: calendarConfig.maximumNumberOfDays || this.props.maximumNumberOfDays,
        fetchInterval: this.props.fetchInterval,
      }
    });
  }

  render() {

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
