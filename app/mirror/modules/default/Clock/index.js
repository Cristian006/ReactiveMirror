// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styles from './Clock.css';

class Clock extends Component {

  constructor(props: any) {
    super(props);
    this.updateClock = this.updateClock().bind(this);
  }

  componentDidMount() {
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
    let timeString;
    let now = moment();
  }

  render() {
    return (
      <div className={styles.Clock}>
      </div>
    );
  }
}

Clock.moduleName = 'Clock';

export default Clock;
