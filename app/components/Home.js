// @flow
import React, { Component } from 'react';
import Compliments from './Compliments/Compliments';

export default class Home extends Component {


  render() {
    return (
      <div>
        <div data-tid="container">
          
          <Compliments />
        </div>
      </div>
    );
  }
}
