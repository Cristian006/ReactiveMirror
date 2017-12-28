// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import styles from './Compliments.css';
import notifications from '../../../core/notifications';
import { defaultCompliments, getRandom, complimentFile, weatherIconTable } from './core/utils';

class Compliments extends Component {

  constructor(props: any) {
    super(props);
    if (this.props.config && this.props.config.remoteFile) {
      complimentFile(this.props.config.remoteFile, (response) => {
        this.setState({
          compliments: JSON.parse(response)
        });
      });
    }

    this.updateModule = this.updateModule.bind(this);
    this.hideShowModule = this.hideShowModule.bind(this);
    this.randomIndex = this.randomIndex.bind(this);
    this.complimentArray = this.complimentArray.bind(this);
  }

  state = {
    opacity: 0,
    intervalId: null,
    showHideTimer: null,
    complimentIndex: 0,
    currentWeatherType: '',
    lastComplimentIndex: -1,
    compliments: defaultCompliments,
    currentCompliments: [],
    hidden: true,
  };

  componentDidMount() {
    this.updateModule();
    this.setState({
      intervalId: setInterval(() => {
        this.updateModule();
      }, this.props.updateInterval),
    });

    notifications.on('NOTIFICATION', (arg) => {
      switch (arg.type) {
        case 'CURRENTWEATHER_DATA':
          this.setState({
            currentWeatherType: weatherIconTable[arg.payload.weather[0].icon]
          });
          break;
      }
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
        showHideTimer: setTimeout(() => { callback(); }, this.props.fadeSpeed / 2),
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

  updateModule() {
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
        className="thin xlarge bright"
        style={{
          transition: `opacity ${(this.props.fadeSpeed / 2)}ms ${this.props.animation}`,
          opacity: this.state.opacity
        }}
      >
        {this.state.currentCompliments[this.state.complimentIndex]}
      </div>
    );
  }
}

Compliments.moduleName = 'Compliments';

Compliments.defaultProps = {
  fadeSpeed: 4000,
  updateInterval: 30000,
  animation: 'ease-in',
  position: 'lower_third',
};

Compliments.propTypes = {
  fadeSpeed: PropTypes.number,
  updateInterval: PropTypes.number,
  animation: PropTypes.string,
  position: PropTypes.string
};

export default Compliments;
