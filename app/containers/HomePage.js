import React, { Component } from 'react';
import Home from '../components/Home/Home';

export default class HomePage extends Component {
  render() {
    return (
	    <div className="container-fluid">
		    <div className="row">
			    <div className="col"/>
			    <div className="col-11 col-sm-12 center-block">
				    <Home />
			    </div>
			    <div className="col"/>
		    </div>
	    </div>
    );
  }
}
