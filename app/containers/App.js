// @flow
import React, { Component } from 'react';
import type { Children } from 'react';
import Navbar from 'components/Navbar/Navbar';
type Props = {
	children: Children
};
export default class App extends Component<Props> {
  render() {
    return (
      <React.Fragment>
        <Navbar/>
        {this.props.children}
      </React.Fragment>
    );
  }
}
