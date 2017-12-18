import React, { Component } from 'react';

export default class WeatherDetail extends Component {
  render() {
    let windDir = '';
    if (this.props.showWindDirection) {
      if (this.props.showWindDirectionAsArrow && this.props.windDegrees) {
        console.log("degrees");
        windDir = (<i className="fa fa-long-arrow-down" style={{ transform: `rotate(${this.props.windDegrees}deg)` }} />);
      } else if (this.props.windDegrees) {
        windDir = `${this.props.windDegrees}`;
      } else {
        windDir = this.props.units === 'imperial' ? 'MPH' : 'KPH';
      }
    }

    return (
      <div className="normal medium">
        <span className="wi wi-string-wind dimmed" />
        <span> {this.props.windSpeed}</span>
        {
          (this.props.showWindDirection && windDir) &&
          <sup>&nbsp;{windDir}&nbsp;</sup>
        }
        <span>&nbsp;</span>
        {
          this.props.showHumidity &&
          <span>{this.props.humidity}&nbsp;<sup className="wi wi-humidity humidityIcon">&nbsp;</sup></span>
        }
        <span className={`wi dimmed ${this.props.sunriseSunsetIcon}`} />
        <span> {this.props.sunriseSunsetTime}</span>
      </div>
    );
  }
}
