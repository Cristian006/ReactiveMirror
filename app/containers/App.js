// @flow
import React, { Component } from 'react';
import type { Children } from 'react';
//TODO: REMOVE MOUSE HIDING SINCE IT'S HANDLED BY RASPBERRY PI
export default class App extends Component {
  props: {
    children: Children
  };

  constructor(props) {
    super(props);
    this.mouseMove = this.mouseMove.bind(this);
    this.state = {
      mouseTimer: setTimeout(()=> {
        this.setState({
          cursorVisible: false,
          forceHide: true,
        });
        setTimeout(() => {
          this.setState({
            forceHide: false,
          });
        }, 200);
      }, 4000),
      cursorVisible: false,
      forceHide: false
    };
  }

  mouseMove() {
    if (!this.state.forceHide && this.state.mouseTimer){
      this.setState({
        cursorVisible: true,
      });

      clearTimeout(this.state.mouseTimer);

      this.setState({
        mouseTimer: setTimeout(()=> {
          this.setState({
            cursorVisible: false,
            forceHide: true,
          });
          setTimeout(() => {
            this.setState({
              forceHide: false,
            });
          }, 200);
        }, 4000)
      });
    }
  }

  render() {
    const configStyle = {
      color: '#fff',
      padding: '16px',
      borderRadius: '5px',
      borderWidth: '2px',
      borderColor: '#fff',
      backgroundColor: '#eeee',
      fontSize: '48px',
      width: 'fit-content',
      zIndex: '1000',
      position: 'fixed',
      top: 0,
      right: 0,
      justifyContent: 'center',
      display: this.state.cursorVisible ? 'flex' : 'none'
    };

    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh', cursor: this.state.cursorVisible ? 'default' : 'none' }} onMouseMove={this.mouseMove}>
        {this.props.children}
        <div style={configStyle}>
          <i className="fa fa-cog" />
        </div>
      </div>
    );
  }
}
