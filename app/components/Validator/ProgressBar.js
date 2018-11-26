import React from 'react';

const ProgressBar = (props) => (
	<div className={`progress${props.bsClass ? ` bg-${props.bsClass}` : ''}`}>
		<div className="progress-bar progress-bar-striped progress-bar-animated"
		     style={{width: `${props.percent}%`}}
		>
			{props.percent}%
		</div>
	</div>
);

export default ProgressBar;
