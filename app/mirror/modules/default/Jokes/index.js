// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getJoke } from './core/utils';

class Jokes extends Component {

  constructor(props: any) {
    super(props);
    this.updateModule = this.updateModule.bind(this);
    this.hideShowModule = this.hideShowModule.bind(this);
  }

  state = {
    opacity: 0,
    hidden: true,
    intervalId: null,
    showHideTimer: null,
    joke: ''
  };

  componentDidMount() {
    this.updateModule();
    this.setState({
      intervalId: setInterval(() => {
        this.updateModule();
      }, this.props.updateInterval)
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

  updateModule() {
    this.hideShowModule(true, () => {
      getJoke((j)=>{
        this.setState({
          joke: j,
        }, () => {
          this.hideShowModule(false);
        });
      });
    });
  }

  render() {
    return (
      <div
        className={`bright medium light ${!this.props.wrapJoke ? ' no-wrap' : ''}`}
        style={{
          transition: `opacity ${(this.props.fadeSpeed / 2)}ms ${this.props.animation}`,
          opacity: this.state.opacity
        }}
      >
        {this.state.joke}
      </div>
    );
  }
}

Jokes.moduleName = 'Jokes';

Jokes.defaultProps = {
  fadeSpeed: 4000,
  updateInterval: 30000, // update the module to change the current item every 30 seconds
  animation: 'ease-in',
  wrapJoke: true
};

Jokes.propTypes = {
  fadeSpeed: PropTypes.number,
  updateInterval: PropTypes.number,
  animation: PropTypes.string,
  wrapJoke: PropTypes.bool
};

export default Jokes;
