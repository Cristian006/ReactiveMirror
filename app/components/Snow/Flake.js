import React, { Component } from 'react';
import styles from './Snow.css';

export default class Flake extends Component {
  render() {
    return (
      <div
        className={styles.snowFlake}
        style={{
          left: this.props.flakePosition,
          animationDelay: this.props.animDelay,
          animationDuration: `${100 - (Math.random() * 50 * this.props.flakeSize)}s`
        }}
      >
        <div
          className={styles.flake}
          style={{
            backgroundImage: `url('./components/Snow/images/flake${this.props.flakeIndex}.png')`,
            transform: `scale(${this.props.flakeSize}, ${this.props.flakeSize})`,
            opacity: this.props.flakeSize,
            animationDuration: this.props.flakeAnimationDuration,
            animationDelay: this.props.flakeAnimationDelay,
          }}
        />
      </div>
    );
  }
}
