// @flow
import React, { Component } from 'react';
import getComponents from '../mirror/core/components';
import config from '../mirror/config/config';
import { getConfig } from '../mirror/core/utils';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.loadInComponents = this.loadInComponents.bind(this);
  }

  state = {
    components: null,
  };

  componentDidMount() {
    this.setState({
      components: this.loadInComponents()
    });
  }

  loadInComponents() {
    const comps = {};
    const components = getComponents();
    console.log(components);
    config.modules.map((item) => {
      if (item.name in components) {
        console.log(item.name);
        const Component = components[item.name];
        if (item.name in comps) {
          comps[item.position] = [...comps[item.position], <Component key={item.name} />];
        } else {
          comps[item.position] = <Component key={item.name} {...getConfig(item.name)}/>;
        }
      }
    });
    return comps;
  }

  render() {
    if (this.state.components) {
      return (
        <div>
          <div data-tid="container">
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
            <div className="region lower third"><div className="container">{this.state.components.lower_third}<br/></div></div>
            <div className="region bottom bar">
              <div className="container">{this.state.components.bottom_bar}</div>
              <div className="region bottom left"><div className="container">{this.state.components.bottom_left}</div></div>
              <div className="region bottom center"><div className="container">{this.state.components.bottom_center}</div></div>
              <div className="region bottom right"><div className="container">{this.state.components.bottom_right}</div></div>
            </div>
            <div className="region fullscreen above"><div className="container">{this.state.components.fullscreen_above}</div></div>
          </div>
        </div>
      );
    }
    return (
      <div></div>
    );
  }
}
