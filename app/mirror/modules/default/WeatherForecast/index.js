// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment-timezone';
import request from 'request';
import styles from './WeatherForecast.css';
import { roundValue, ms2Beaufort, deg2Cardinal, iconTable } from './core/utils';
import notifications from '../../../core/notifications';

class WeatherForecast extends Component {

  constructor(props: any) {
    super(props);
    this.updateModule = this.updateModule.bind(this);
    this.hideShowModule = this.hideShowModule.bind(this);
    this.processWeather = this.processWeather.bind(this);
    this.updateWeather = this.updateWeather.bind(this);
    this.getHeader = this.getHeader.bind(this);
    this.getUrlParams = this.getUrlParams.bind(this);
  }

  state = {
    intervalId: null,
    windSpeed: null,
    windDirection: null,
    windDegrees: null,
    sunriseSunsetTime: null,
    sunriseSunsetIcon: null,
    temperature: null,
    humidity: null,
    indoorTemperature: null,
    indoorHumidity: null,
    weatherType: null,
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
      }, this.props.updateInterval),
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
        case 'INDOOR_TEMPURATURE':
          this.setState({
            indoorTemperature: roundValue(arg.payload)
          });
          break;
        case 'INDOOR_HUMIDITY':
          this.setState({
            indoorHumidity: roundValue(arg.payload)
          });
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
        if(data.error) {
          console.log(data.error);
          return;
        }
        this.setState({
          ...this.processWeather(data),
        }, ()=>{
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

  processWeather(data) {
    if (!data || !data.main || typeof data.main.temp === 'undefined') {
      // Did not receive usable new data.
      // Maybe this needs a better check?
      return;
    }

    const weatherObj = {
      humidity: parseFloat(data.main.humidity),
      temperature: roundValue(data.main.temp),
    };

    weatherObj.windSpeed = this.props.useBeaufort ? ms2Beaufort(roundValue(data.wind.speed))
      : parseFloat(data.wind.speed).toFixed(0);

    weatherObj.windDirection = deg2Cardinal(data.wind.deg);
    weatherObj.windDegrees = data.wind.deg;
    weatherObj.weatherType = iconTable[data.weather[0].icon];

    const now = new Date();
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    // The moment().format('h') method has a bug on the Raspberry Pi.
    // So we need to generate the timestring manually.
    // See issue: https://github.com/MichMich/MagicMirror/issues/181
    const sunriseSunsetDateObject = (sunrise < now && sunset > now) ? sunset : sunrise;
    let timeString = moment(sunriseSunsetDateObject).format('HH:mm');
    if (this.props.timeFormat !== 24) {
      // var hours = sunriseSunsetDateObject.getHours() % 12 || 12;
      if (this.props.showPeriod) {
        if (this.props.showPeriodUpper) {
          // timeString = hours + moment(sunriseSunsetDateObject).format(':mm A');
          timeString = moment(sunriseSunsetDateObject).format('h:mm A');
        } else {
          // timeString = hours + moment(sunriseSunsetDateObject).format(':mm a');
          timeString = moment(sunriseSunsetDateObject).format('h:mm a');
        }
      } else {
        // timeString = hours + moment(sunriseSunsetDateObject).format(':mm');
        timeString = moment(sunriseSunsetDateObject).format('h:mm');
      }
    }

    weatherObj.sunriseSunsetTime = timeString;
    weatherObj.sunriseSunsetIcon = (sunrise < now && sunset > now) ? 'wi-sunset' : 'wi-sunrise';
    // this.show(this.config.animationSpeed, {lockString:this.identifier});
    weatherObj.loading = false;
    notifications.emit('NOTIFICATION', { type: 'CURRENTWEATHER_DATA', payload: data });
    return weatherObj;
  }

  getUrlParams() {
    let params = '?';
    if (this.props.locationID) {
      params += `id=${this.props.locationID}`;
    } else if (this.props.location) {
      params += `q=${this.props.location}`;
    } else if (this.firstEvent && this.firstEvent.geo) {
      params += `lat=${this.firstEvent.geo.lat}&lon=${this.firstEvent.geo.lon}`;
    } else if (this.firstEvent && this.firstEvent.location) {
      params += `q=${this.firstEvent.location}`;
    } else {
      console.log('hide???');
      // this.hide(this.props.animationSpeed, {lockString:this.identifier});
      return;
    }

    params += `&units=${this.props.units}`;
    params += `&lang=${this.props.lang}`;
    params += `&APPID=${this.props.appid}`;

    return params;
  }
  
  updateWeather(callback) {
    if (this.props.appid === '') {
      console.log("[ERROR] WeatherForecast: APPID not set!");
      return;
    }

    const URL = `${this.props.apiBase}${this.props.apiVersion}/${this.props.weatherEndpoint}${this.getUrlParams()}`;
    let retry = true;

    request({
      method: 'GET',
      url: URL,
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log(body);
        callback(JSON.parse(body));
        return;
      } else if (response.statusCode === 401) {
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
  
  getHeader() {
    if (this.props.appendLocationNameToHeader) {
			return `${this.props.header} ${this.props.fetchedLocatioName}`;
		}
		return this.props.header;
  }

  generateTable() {
    if(this.state.forecast.length > 0) {
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
          <tr className={classNames({
            [styles.colored]: this.props.colored,
          })} 
          style={{opacity: op}}>
            <td className={styles.day}>{f.day}</td>
            <td className={classNames({
              "bright": true,
              [styles.weathericon]: true,
            })}>
              <span className={`wi weathericon ${f.icon}`} />
            </td>
            <td className={classNames({
              "align-right bright": true,
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
          Please set the correct openweather <i>appid</i> in the config for module: {this.moduleName}.
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
          {}
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
  updateInterval: 600000, // every 10 minutes
  animationSpeed: 1000,
  timeFormat: 12,
  showPeriod: true,
  showPeriodUpper: false,
  showWindDirection: true,
  showWindDirectionAsArrow: true,
  useBeaufort: true,
  lang: "en",
  showHumidity: false,
  showDegreeLabel: true,
  showIndoorTemperature: false,
  showIndoorHumidity: false,
  initialLoadDelay: 0, // 0 seconds delay
  retryDelay: 2500,
  apiVersion: "2.5",
  apiBase: "http://api.openweathermap.org/data/",
  forecastEndpoint: "forecast/daily",
  appendLocationNameToHeader: true,
  calendarClass: "calendar",
  colored: true,
  onlyTemp: false,
  roundTemp: false
};

WeatherForecast.propTypes = {
  fadeSpeed: PropTypes.number,
  updateInterval: PropTypes.number,
  animation: PropTypes.string,
  position: PropTypes.string
};

export default WeatherForecast;
