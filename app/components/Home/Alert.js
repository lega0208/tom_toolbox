import React from 'react';

export default function Alert (props) {
	const type = props.type;
	const title = type === 'danger' ? 'Error' : 'Success!';
	const message = props.error || 'Result has been copied to your clipboard.';
	const display = props.show ? 'show' : 'hide';

	return (
		<div className="container">
			<div className="row">
				<div className="col" />
				<div className="col-auto">
					<div className={`mb-1 mt-2 px-3 py-2 alert alert-${type} fade ${display}`} role="alert">
						<h3 className="alert-heading mt-0">{title}</h3>
						<p className="mb-0">{message}</p>
					</div>
				</div>
				<div className="col" />
			</div>
		</div>
	);
};