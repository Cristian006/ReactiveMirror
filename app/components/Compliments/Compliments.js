// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styles from './Compliments.css';
import { defaultCompliments, getRandom, complimentFile } from './utils/util';
import { getConfig } from '../../mirror/utils/utils';

class Compliments extends Component {

  constructor(props: any) {
    super(props);
    this.mod = getConfig(Compliments.moduleName);
    if (this.mod.config && this.mod.config.remoteFile) {
      complimentFile(this.mod.config.remoteFile, (response) => {
        this.setState({
          compliments: JSON.parse(response)
        });
      });
    }
  }

  state = {
    position: 'lower_third',
    updateInterval: 3000, /* 30000 */
    intervalId: null,
    fadeSpeed: 1000, /* 4000 */
    currentWeatherType: '',
    compliments: defaultCompliments,
    currentCompliments: [],
    complimentIndex: 0,
    lastComplimentIndex: -1
  };

  componentDidMount() {
    let id = setInterval(() => {
      this.updateCompliments();
    }, this.state.updateInterval);
    
    this.setState({
      intervalId: id,
      ...this.mod.config,
    });
  }

  componentWillUpdate(nextProps, nextState) {
    return (
      nextState.complimentIndex !== this.state.complimentIndex ||
      nextState.currentCompliments !== this.state.currentCompliments
    );
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  randomIndex() {
    const len = this.state.currentCompliments.length;

    if (len === 1) {
      return 0;
    }

    let compIndex = getRandom(len);

    while (compIndex === this.state.lastComplimentIndex) {
      compIndex = getRandom(len);
    }

    this.setState({
      lastComplimentIndex: compIndex,
    });

    return compIndex;
  }

  complimentArray() {
    const hour = moment().hour();
    let compliments = [];

    if (hour >= 3 && hour < 12 && this.state.compliments.hasOwnProperty('morning')) {
      compliments = this.state.compliments.morning;
    } else if (hour >= 12 && hour < 17 && this.state.compliments.hasOwnProperty('afternoon')) {
      compliments = this.state.compliments.afternoon;
    } else if (this.state.compliments.hasOwnProperty('evening')) {
      compliments = this.state.compliments.evening;
    }

    if (this.state.currentWeatherType in this.state.compliments) {
      compliments = [...compliments, this.state.compliments[this.state.currentWeatherType]];
    }

    compliments = [...compliments, ...this.state.compliments.anytime];

    return compliments;
  }

  updateCompliments() {
    this.setState({
      complimentIndex: this.randomIndex(),
      currentCompliments: this.complimentArray()
    });
  }

  render() {
    return (
      <div className={styles.container}>
        {this.state.currentCompliments[this.state.complimentIndex]}
      </div>
    );
  }
}

Compliments.moduleName = 'Compliments';

export default Compliments;
