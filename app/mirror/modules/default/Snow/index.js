// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './Snow.css';
import Flake from './Flake';

class Snow extends Component {

  constructor(props: any) {
    super(props);
    this.generateDom = this.generateDom.bind(this);
  }

  generateDom() {
    return Array.from(new Array(this.props.flakeCount), (item, index) => {
      return (
        <Flake
          key={`flake${index}`}
          flakeIndex={(Math.round(Math.random() * 2) + 1)}
          flakeSize={(Math.random() * 0.75) + 0.25}
          flakeAnimationDelay={`${(Math.random() * 4)}s`}
          flakeAnimationDuration={`${((Math.random() * 30) + 30)}s`}
          flakePosition={`${((Math.random() * 100) - 10)}%`}
          animDelay={`${(Math.random() * 100)}s`}
        />
      );
    });
  }

  render() {
    return (
      <div className={styles.Snow}>
        {this.generateDom()}
      </div>
    );
  }
}

Snow.moduleName = 'Snow';

Snow.defaultProps = {
  position: 'full_screen_above',
  flakeCount: 100,
};

Snow.propTypes = {
  position: PropTypes.string,
  flakeCount: PropTypes.number
};

export default Snow;
