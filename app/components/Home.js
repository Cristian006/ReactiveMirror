// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import Compliments from './Compliments/Compliments';
import Snow from './Snow/Snow';

export default class Home extends Component {
  render() {
    return (
      <div>
        <div data-tid="container">
          <div
            className="region fullscreen below"><div className="container"></div></div>
          <div className="region top bar">
            <div className="container"></div>
            <div className="region top left"><div className="container"></div></div>
            <div className="region top center"><div className="container"></div></div>
            <div className="region top right"><div className="container"></div></div>
          </div>
          <div className="region upper third"><div className="container"></div></div>
          <div className="region middle center"><div className="container"></div></div>
          <div className="region lower third"><div className="container"><Compliments /><br/></div></div>
          <div className="region bottom bar">
            <div className="container"></div>
            <div className="region bottom left"><div className="container"></div></div>
            <div className="region bottom center"><div className="container"></div></div>
            <div className="region bottom right"><div className="container"></div></div>
          </div>
          <div className="region fullscreen above"><div className="container"><Snow /></div></div>
        </div>
      </div>
    );
  }
}
