// @flow
import React, { Component } from 'react';
import type { Children } from 'react';
import Navbar from 'components/Navbar/Navbar';
import getPathsCache from 'database/paths-cache';
type Props = {
	children: Children
};
export default class App extends Component<Props> {
	componentDidMount() {
		this.cache = getPathsCache();
		setTimeout(() => this.cache.validateCache().then(() => console.log('cache validated?')), 100);
	}

	componentWillUnmount() {
		this.cache.close()
	}

  render() {
    return (
      <React.Fragment>
        <Navbar/>
        {this.props.children}
      </React.Fragment>
    );
  }
}
