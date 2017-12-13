// @flow
import React from 'react';
import getModules from '../mirror/core/components';
import styles from './Mirror.css';

export default class Mirror extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      components: getModules(),
    };
  }

  render() {
    if (this.state.components) {
      return (
        <div className={styles.mirror} data-tid="container">
          <div className="region fullscreen below">
            <div className="container">
            </div>
          </div>
          <div className="region top bar">
            <div className="container">
              {this.state.components.top_bar}
            </div>
            <div className="region top left">
              <div className="container">
                {this.state.components.top_left}
              </div>
            </div>
            <div className="region top center">
              <div className="container">
                {this.state.components.top_center}
              </div>
            </div>
            <div className="region top right">
              <div className="container">
                {this.state.components.top_right}
              </div>
            </div>
          </div>
          <div className="region upper third"><div className="container">{this.state.components.upper_third}</div></div>
          <div className="region middle center"><div className="container">{this.state.components.middle_center}</div></div>
          <div className="region lower third"><div className="container"><br/>{this.state.components.lower_third}</div></div>
          <div className="region bottom bar">
            <div className="container">{this.state.components.bottom_bar}</div>
            <div className="region bottom left"><div className="container">{this.state.components.bottom_left}</div></div>
            <div className="region bottom center"><div className="container">{this.state.components.bottom_center}</div></div>
            <div className="region bottom right"><div className="container">{this.state.components.bottom_right}</div></div>
          </div>
          <div className="region fullscreen above" ><div className="container">{this.state.components.fullscreen_above}</div></div>
        </div>
      );
    }
    return (
      <div className={styles.mirror}>Reactive Mirror</div>
    );
  }
}
