import React, { Component } from 'react';
import Sidebar from './Sidebar';

export default class References extends Component {
	constructor(props) {
		super(props);
		this.state = {
			wetVersion: 2,
			url: 'http://infozone/english/r1713497/org/sa/sa06/sb/sb01/tlr/cnt2/index-e.html',
		};
		this.navigate = this.navigate.bind(this);
	}

	navigate(url, e) {
		this.setState({url});
		e.preventDefault();
	}

	render() {
		return (
			<div className="container-fluid">
				<div className="row mt-1">
					<div className="col-4 col-md-3 col-lg-2">
						<Sidebar wetVersion={this.state.wetVersion} navigate={this.navigate} />
					</div>
					<div className="col-8 col-md-9 col-lg-10 embed-responsive embed-responsive-1by1" style={{maxHeight: '92vh', minHeight: '90vh'}}>
						<iframe src={this.state.url} className="embed-responsive-item border h-100" />
					</div>
				</div>
			</div>
		);
	}
}

