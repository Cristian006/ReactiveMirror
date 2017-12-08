// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import styles from './Clock.css';

class Clock extends Component {

  constructor(props: any) {
    super(props);
    this.updateClock = this.updateClock.bind(this);
    moment.locale('en');
  }

  state = {
    date: '',
    week: '',
    time: '',
    period: '',
    seconds: '',
  }

  componentDidMount() {
    this.updateClock();
    this.setState({
      timeIntervalID: setInterval(() => {
        this.updateClock();
      }, 1000)
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.timeIntervalID);
  }

  updateClock() {
    let now = moment();
    if (this.props.timezone) {
      now.tz(this.props.timezone);
    }

    let hourSymbol = this.props.timeFormat === 24 ? 'HH' : 'h';
    let timeString = this.props.clockBold ? now.format(hourSymbol + "[<span className=\"bold\">]mm[</span>]") : now.format(`${hourSymbol}:mm`);
    let dateString = now.format(this.props.dateFormat);
    let weekString = `${'WEEK'} ${now.week()}`;
    let secondsString = now.format('ss');
    let periodString = this.props.showPeriodUpper ? now.format('A') : now.format('a');
    this.setState({
      time: timeString,
      date: dateString,
      week: weekString,
      seconds: secondsString,
      period: periodString,
    });
  }

  render() {
    return (
      <div className={styles.Clock}>
        <div className={classNames({
          [styles.date]: true,
          'normal medium': true,
        })}>{this.state.date}</div>
        <div className={classNames({
          [styles.time]: true,
        })}>
          {`${this.state.time}`}
          <sup className={'dimmed'}>{this.state.seconds}</sup>
          <span>{this.state.period}</span>
        </div>
        <div className={classNames({
          [styles.week]: true,
          'dimmed medium': true,
        })}>{this.state.week}</div>
      </div>
    );
  }
}

Clock.moduleName = 'Clock';

Clock.defaultProps = {
  displayType: 'digital',
  timeFormat: 12,
  displaySeconds: true,
  showPeriod: true,
  showPeriodUpper: false,
  clockBold: false,
  showDate: true,
  showWeek: false,
  dateFormat: "dddd, LL",
};

Clock.propTypes = {
  position: PropTypes.string
};

export default Clock;
