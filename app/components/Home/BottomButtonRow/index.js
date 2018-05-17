import React from 'react';

export default function BottomButtonRow(props) {
	const { convertlist } = props;
	return (
		<div className="container-fluid">
			<div className="row">
				<button className="btn btn-primary col-7 col-md-8"
								onClick={convertlist}>
					<span className="h6">Convert list</span>
				</button>
				<button type="button" className="btn btn-success col-5 col-md-4"
								data-toggle="modal"
								data-target="#preview">
					<span className="h6">Show rendered HTML</span>
				</button>
			</div>
		</div>
	);
}