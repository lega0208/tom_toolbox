import React, { Component } from 'react';
import Home from '../components/Home/Home';

export default class HomePage extends Component {
  render() {
    return (
	    <div className="container-fluid">
		    <div className="row">
			    <div className="col-xl-10 col-md-11 col-12 mx-auto">
				    <Home />
			    </div>
					<div className="clearfix" />
		    </div>
	    </div>
    );
  }
}
