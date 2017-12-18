// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment-timezone';
import request from 'request';
import styles from './WeatherForecast.css';
import { processWeather } from './core/utils';
import notifications from '../../../core/notifications';

class WeatherForecast extends Component {

  constructor(props: any) {
    super(props);
    this.updateModule = this.updateModule.bind(this);
    this.hideShowModule = this.hideShowModule.bind(this);
    this.updateWeather = this.updateWeather.bind(this);
    this.getUrlParams = this.getUrlParams.bind(this);
    this.generateTable = this.generateTable.bind(this);
  }

  state = {
    forecastEndpoint: 'forecast/daily',
    maxNumberOfDays: 1,
    fetchedLocationName: '',
    intervalId: null,
    windSpeed: null,
    windDirection: null,
    weatherType: null,
    forecast: [],
    loading: true
  };

  componentDidMount() {
    if (this.props.language) {
      moment.loacale(this.props.language);  
    }

    this.updateModule();
    this.setState({
      intervalId: setInterval(() => {
        this.updateModule();
      }, this.props.updateInterval)
    });

    notifications.on('NOTIFICATION', (arg) => {
      switch (arg.type) {
        case 'CALENDAR_EVENTS':
          for (var e in arg.payload) {
            if (e.location || e.geo) {
              this.setState({
                firstEvent: event,
              });
            }
          }
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

  getUrlParams() {
    let params = '?';
    if (this.props.locationID) {
      params += `id=${this.props.locationID}`;
    } else if (this.props.location) {
      params += `q=${this.props.location}`;
    } else if (this.firstEvent && this.firstEvent.geo) {
      params += `lat=${this.state.firstEvent.geo.lat}&lon=${this.state.firstEvent.geo.lon}`;
    } else if (this.state.firstEvent && this.state.firstEvent.location) {
      params += `q=${this.state.firstEvent.location}`;
    } else {
      console.log('hide???');
      // this.hide(this.props.animationSpeed, {lockString:this.identifier});
      return;
    }

    params += `&units=${this.props.units}`;
    params += `&lang=${this.props.lang}`;
    params += `&cnt=${(((this.state.maxNumberOfDays < 1) || (this.state.maxNumberOfDays > 16)) ? 7 * 8 : this.state.maxNumberOfDays)}`;
    params += `&APPID=${this.props.appid}`;
    return params;
  }

  updateWeather(callback) {
    if (this.props.appid === '') {
      console.log('[ERROR] WeatherForecast: APPID not set!');
      return;
    }

    const URL = `${this.props.apiBase}${this.props.apiVersion}/${this.state.forecastEndpoint}${this.getUrlParams()}`;
    let retry = true;
    request({
      method: 'GET',
      url: URL,
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        callback(JSON.parse(body));
        return;
      } else if (response.statusCode === 401) {
        this.setState({
          forecastEndpoint: 'forecast',
          maxNumberOfDays: this.state.maxNumberOfDays * 8,
        });
        console.log(WeatherForecast.moduleName + ": Your AppID does not support long term forecasts. Switching to fallback endpoint.");
        retry = true;
      } else {
        callback({ error: `${WeatherForecast.moduleName}: Could not load weather.` });
      }
      if (retry) {
        setTimeout(() => {
          this.updateModule();
        }, this.state.loading ? 0 : this.props.retryDelay);
      }
    });
  }

  generateTable() {
    if (this.state.forecast.length > 0) {
      return this.state.forecast.map((f, indx) => {
        let degreeLabel = '';
        if (this.props.scale) {
          switch (this.props.units) {
            case 'metric':
              degreeLabel = 'C';
              break;
            case 'imperial':
              degreeLabel = 'F';
              break;
            default:
              degreeLabel = 'K';
              break;
          }
        }

        let rainCell;
        let rainText = this.props.units !== 'imperial' ? `${f.rain} mm` : (parseFloat(f.rain) / 25.4).toFixed(2) + ' in';
        if (this.props.showRainAmount) {
          rainCell = (
            <td className={classNames({
              'align-right bright': true,
              [styles.rain]: true
            })}>
              {rainText}
            </td>
          );
        }
        let op = 1;
        if (this.props.fade && this.props.fadePoint < 1) {
          let fPoint = this.props.fadePoint > 0 ? this.props.fadePoint : 0;
          let startPoint = this.state.forecast.length * fPoint;
          let steps = this.state.forecast.length - startPoint;
          if (indx >= startPoint) {
            let currentStep = indx - startPoint;
            op = 1 - ((1 / steps) * currentStep);
          }
        }

        return (
          <tr
            key={`${f.day}_${indx}`}
            className={classNames({
              [styles.colored]: this.props.colored,
            })} 
            style={{ opacity: op }}
          >
            <td className={styles.day}>{this.props.showTime ? f.timeOfDay : ''}</td>
            <td className={styles.day}>{f.day}</td>
            <td className={classNames({
              bright: true,
              [styles.weathericon]: true,
            })}>
              <span className={`wi weathericon ${f.icon}`} />
            </td>
            <td className={classNames({
              'align-right bright': true,
              [styles.maxTemp]: true,
            })}>
              {f.maxTemp}{degreeLabel}
            </td>
            <td className={classNames({
              "align-right": true,
              [styles.minTemp]: true,
            })}>
              {f.minTemp}{degreeLabel}
            </td>
          </tr>
        );
      });
    }
  }

  render() {
    if (!this.props.appid) {
      return (
        <div className="dimmed light small">
          Please set the correct openweather <i>appid</i> in the config for module: 
          {this.moduleName}.
        </div>
      );
    }

    if (this.state.loading) {
      return (
        <div className="dimmed light small">
          Loading
        </div>
      );
    }

    return (
      <div
        className={styles.WeatherForecast}
        style={{
          transition: `opacity ${(this.props.fadeSpeed / 2)}ms ${this.props.animation}`,
          opacity: this.state.opacity
        }}
      >
        <table className="small">
          <tbody>
            {this.generateTable()}
          </tbody>
        </table>
      </div>
    );
  }
}

WeatherForecast.moduleName = 'WeatherForecast';

WeatherForecast.defaultProps = {
  location: false,
  locationID: false,
  appid: "",
  units: "imperial",
  showRainAmount: false,
  updateInterval: 600000, // every 10 minutes
  animationSpeed: 1000,
  timeFormat: 12,
  lang: "en",
  fade: true,
  fadePoint: 0.25,
  colored: true,
  scale: false,
  initialLoadDelay: 0, // 0 seconds delay
  retryDelay: 2500,
  apiVersion: "2.5",
  apiBase: "http://api.openweathermap.org/data/",
  appendLocationNameToHeader: true,
  calendarClass: "calendar",
  roundTemp: false,
  showTime: true
};

WeatherForecast.propTypes = {
  fadeSpeed: PropTypes.number,
  updateInterval: PropTypes.number,
  animation: PropTypes.string,
  position: PropTypes.string
};

export default WeatherForecast;
