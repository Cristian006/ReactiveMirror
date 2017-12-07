// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import styles from './Compliments.css';
import { defaultCompliments, getRandom, complimentFile } from './core/utils';
import { getConfig } from '../../../../mirror/core/utils';

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

    this.updateCompliments = this.updateCompliments.bind(this);
    this.hideShowModule = this.hideShowModule.bind(this);
    this.randomIndex = this.randomIndex.bind(this);
    this.complimentArray = this.complimentArray.bind(this);
  }

  state = {
    position: 'lower_third',
    animation: 'ease-in',
    opacity: 0,
    intervalId: null,
    showHideTimer: null,
    fadeSpeed: 4000,
    updateInterval: 30000,
    complimentIndex: 0,
    currentWeatherType: '',
    lastComplimentIndex: -1,
    compliments: defaultCompliments,
    currentCompliments: [],
    hidden: true,
  };

  componentDidMount() {
    this.updateCompliments();
    let id = setInterval(() => {
      this.updateCompliments();
    }, this.state.updateInterval);
    this.setState({
      intervalId: id,
      ...this.mod.config,
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    clearTimeout(this.state.showHideTimer);
  }

  hideShowModule(hide: boolean, callback: any) {
    this.setState({
      opacity: hide ? 0 : 1,
      hidden: hide
    });
    if (hide && callback) {
      this.setState({
        showHideTimer: setTimeout(() => { callback(); }, this.state.fadeSpeed / 2),
      });
    } else {
      clearTimeout(this.state.showHideTimer);
    }
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
    this.hideShowModule(true, () => {
      this.setState({
        complimentIndex: this.randomIndex(),
        currentCompliments: this.complimentArray(),
      }, () => {
        this.hideShowModule(false);
      });
    });
  }

  render() {
    //console.log(this.state.opacity);
    return (
      <div
        className={classNames ({
          [styles.container]: true,
          'thin xlarge bright': true,
        })}
        style={{
          transition: `opacity ${(this.state.fadeSpeed / 2)}ms ${this.state.animation}`,
          opacity: this.state.opacity
        }}
      >
        {this.state.currentCompliments[this.state.complimentIndex]}
      </div>
    );
  }
}

Compliments.moduleName = 'Compliments';

export default Compliments;
