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
    this.setState({
      hour: now.format(hourSymbol),
      minute: now.format('mm'),
      date: now.format(this.props.dateFormat),
      week: `${'WEEK'} ${now.week()}`,
      seconds: now.format('ss'),
      period: this.props.showPeriodUpper ? now.format('A') : now.format('a'),
    });
  }

  render() {
    return (
      <div className={styles.Clock}>
        <div className={classNames({
          date: true,
          'normal medium': true,
        })}>{this.state.date}</div>
        <div className={classNames({
          time: true,
          'bright large light': true,
        })}>
          {this.state.hour}
          <span className={this.props.clockBold ? 'bold' : ''}>{this.props.clockBold ? '' : ':'}{this.state.minute}</span>
          <sup className={'dimmed'}>{this.state.seconds}</sup>
          {
            (this.props.showPeriod && this.props.timeFormat !== 24) &&
            <span>{this.state.period}</span>
          }
        </div>
        {
          this.props.showWeek &&
          <div className={classNames({
            week: true,
            'dimmed medium': true,
          })}>{this.state.week}</div>
        }
      </div>
    );
  }
}

Clock.moduleName = 'Clock';

Clock.defaultProps = {
  position: 'top_right',
  displayType: 'digital',
  timeFormat: 12,
  timezone: null,
  displaySeconds: true,
  showPeriod: true,
  showPeriodUpper: true,
  clockBold: false,
  showDate: true,
  showWeek: false,
  dateFormat: "dddd, LL",
};

Clock.propTypes = {
  position: PropTypes.string,
  displayType: PropTypes.string,
  dateFormat: PropTypes.string,
  timeFormat: PropTypes.number,
  displaySeconds: PropTypes.bool,
  showPeriod: PropTypes.bool,
  showPeriodUpper: PropTypes.bool,
  clockBold: PropTypes.bool,
  showDate: PropTypes.bool,
  showWeek: PropTypes.bool,
  timezone: PropTypes.string,
};

export default Clock;
