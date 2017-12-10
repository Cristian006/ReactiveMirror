/*// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import moment from 'moment-timezone';
import WeatherInfo from './WeatherInfo';
import { roundValue, ms2Beaufort, deg2Cardinal } from './core/utils';

class CurrentWeather extends Component {

  constructor(props: any) {
    super(props);
    this.updateModule = this.updateModule.bind(this);
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
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  updateModule() {
    this.hideShowModule(true, () => {
      this.setState({
        ...this.processWeather(data),
      }, () => {
        this.hideShowModule(false);
      });
    });
  }

  processWeather(data) {
    if (!data || !data.main || typeof data.main.temp === 'undefined') {
      // Did not receive usable new data.
      // Maybe this needs a better check?
      return;
    }

    const weatherObj = {
      humidity: parseFloat(data.min.humidity),
      temperature: roundValue(data.min.temp),
    };

    weatherObj.windSpeed = this.props.useBeaufort ? ms2Beaufort(roundValue(data.wind.speed))
      : parseFloat(data.wind.speed).toFixed(0);

    weatherObj.windDirection = deg2Cardinal(data.wind.deg);
    weatherObj.windDeg = data.wind.deg;
    weatherObj.weatherType = this.props.iconTable[data.weather[0].icon];

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
    // this.sendNotification('CURRENTWEATHER_DATA', {data: data});
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
      this.hide(this.props.animationSpeed, {lockString:this.identifier});
      return;
    }

    params += `&units=${this.props.units}`;
    params += `&lang=${this.props.lang}`;
    params += `&APPID=${this.props.appid}`;

    return params;
  }
  
  updateWeather() {
    if (this.props.appid === '') {
      Log.error("CurrentWeather: APPID not set!");
      return;
    }

    let url = `${this.props.apiBase}${this.props.apiVersion}/${this.props.weatherEndpoint}${this.getParams()}`;
    let self = this;
    let retry = true;

    let weatherRequest = new XMLHttpRequest();
    weatherRequest.open('GET', url, true);
    
    weatherRequest.onreadystatechange = (response) => {
      if (this.readyState === 4) {
        if (this.status === 200) {
          this.processWeather(JSON.parse(response));
        } else if (this.status === 401) {
          // self.updateDom(self.config.animationSpeed);

          // Log.error(self.name + ": Incorrect APPID.");
          retry = true;
        } else {
          Log.error(CurrentWeather.moduleName + ": Could not load weather.");
        }

        if (retry) {
          this.scheduleUpdate((!this.loading) ? -1 : this.props.retryDelay);
        }
      }
    };
    
    weatherRequest.send();
  }
  
  getHeader() {
    if (this.props.appendLocationNameToHeader) {
			return `${this.props.header} ${this.props.fetchedLocatioName}`;
		}
		return this.props.header;
  }

  render() {
    if (!this.props.appid) {
      return (
        <div className="dimmed light small">Please set the correct openweather <i>appid</i> in the config for module: {this.moduleName}.</div>
      );
    }

    if (this.state.loading) {
      return (
        <div className="dimmed light small">Loading</div>
      );
    }

    let degreeLabel = '';
    if (this.props.degreeLabel) {
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

    if (this.config.showIndoorHumidity && this.indoorHumidity) {
      
    }	
    return (
      <div>
        {
          (!this.props.onlyTemp) &&
          <WeatherInfo />
        }
        <div className="large light">
          <span className={`wi weathericon ${this.props.weatherType}`} />
          <span className="bright">{this.state.temperature}&deg;{degreeLabel}</span>
          {
            (this.props.showIndoorTemperature && this.state.indoorTemperature) &&
            <span>
              <span className="fa fa-home" />
              <span className="bright">{this.state.indoorTemperature}&deg;{degreeLabel}</span>
            </span>
          }
          {
            (this.props.showIndoorHumidity && this.state.indoorHumidity) &&
            <span>
              <span className="fa fa-tint" />
              <span className="bright">{this.state.indoorHumidity}%</span>
            </span>
          }
        </div>
      </div>
    );
  }
}

CurrentWeather.moduleName = 'CurrentWeather';

CurrentWeather.defaultProps = {
  location: false,
  locationID: false,
  appid: "",
  units: config.units,
  updateInterval: 10 * 60 * 1000, // every 10 minutes
  animationSpeed: 1000,
  timeFormat: config.timeFormat,
  showPeriod: true,
  showPeriodUpper: false,
  showWindDirection: true,
  showWindDirectionAsArrow: false,
  useBeaufort: true,
  lang: config.language,
  showHumidity: false,
  degreeLabel: false,
  showIndoorTemperature: false,
  showIndoorHumidity: false,
  initialLoadDelay: 0, // 0 seconds delay
  retryDelay: 2500,
  apiVersion: "2.5",
  apiBase: "http://api.openweathermap.org/data/",
  weatherEndpoint: "weather",
  appendLocationNameToHeader: true,
  calendarClass: "calendar",
  onlyTemp: false,
  roundTemp: false,
  iconTable: {
    "01d": "wi-day-sunny",
    "02d": "wi-day-cloudy",
    "03d": "wi-cloudy",
    "04d": "wi-cloudy-windy",
    "09d": "wi-showers",
    "10d": "wi-rain",
    "11d": "wi-thunderstorm",
    "13d": "wi-snow",
    "50d": "wi-fog",
    "01n": "wi-night-clear",
    "02n": "wi-night-cloudy",
    "03n": "wi-night-cloudy",
    "04n": "wi-night-cloudy",
    "09n": "wi-night-showers",
    "10n": "wi-night-rain",
    "11n": "wi-night-thunderstorm",
    "13n": "wi-night-snow",
    "50n": "wi-night-alt-cloudy-windy"
  },
};

CurrentWeather.propTypes = {
  fadeSpeed: PropTypes.number,
  updateInterval: PropTypes.number,
  animation: PropTypes.string,
  position: PropTypes.string
};

export default CurrentWeather;
*/
