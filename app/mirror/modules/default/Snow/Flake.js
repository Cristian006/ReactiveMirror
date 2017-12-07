import React, { Component } from 'react';
import classNames from 'classnames';
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
          className={classNames({
            [styles.flake]: true,
            [styles.flake1]: this.props.flakeIndex === 1,
            [styles.flake2]: this.props.flakeIndex === 2,
            [styles.flake3]: this.props.flakeIndex === 3
          })}
          style={{
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
