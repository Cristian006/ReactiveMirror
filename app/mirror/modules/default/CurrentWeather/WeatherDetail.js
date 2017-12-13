import React, { Component } from 'react';

export default class WeatherDetail extends Component {
  render() {
    let winDir = null;
    if (this.props.showWindDirection) {
      if (this.props.showWindDirectionAsArrow && this.props.windDegrees) {
        winDir = (<i className="fa fa-long-arrow-down" style={{ transform: `rotate(${this.windDegrees}deg);` }} />);
      } else {
        winDir = `${this.props.windDegrees}`;
      }
    }

    return (
      <div className="normal medium">
        <span className="wi wi-string-wind dimmed"/>
        <span> {this.props.windSpeed}</span>
        {
          this.props.showWindDirection &&
          <sup>&nbsp;{windDir}&nbsp;</sup>
        }
        <span>&nbsp;</span>
        {
          this.props.showHumidity &&
          <span>{this.props.humidity}&nbsp;<sup className="wi wi-humidity humidityIcon">&nbsp;</sup></span>
        }
        <span className={`wi dimmed ${this.sunriseSunsetIcon}`}></span>
        <span> {this.props.sunriseSunsetTime}</span>
      </div>
    );
  }
}
