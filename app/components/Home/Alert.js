import React from 'react';

export default function Alert(props) {
	const warning = props.warning || undefined;
	const type = props.type;
	const title = type === 'danger' ? 'Error' : 'Success!';
	const message = props.error || 'Result has been copied to your clipboard.';
	const display = props.show ? 'show' : 'hide';

	return (
		<div className={'container' + (!warning.message && !props.show) ? ' mb-5' : ''}>
			{
				warning.message ? (
					<div className="row mt-2">
						<div className="col" />
						<div className="col-auto">
							<div className={`alert alert-warning fade ${warning.show ? 'show' : 'hide'}`} role="alert">
								<h5>Warning:</h5>
								<p className="mb-1">{warning.message}</p>
								{
									warning.error ? <p className="mt-1">Error message: {warning.error}</p> : null
								}
							</div>
						</div>
						<div className="col" />
					</div>
				) : null
			}
			{
				props.show ? (
					<div className="row position-fixed">
						<div className="col" />
						<div className="col-auto">
							<div className={`mb-1 mt-2 px-3 py-2 alert alert-${type} fade ${display}`} role="alert">
								<h3 className="alert-heading mt-0">{title}</h3>
								<p className="mb-0">{message}</p>
							</div>
						</div>
						<div className="col" />
					</div>
				) : null
			}
		</div>
	);
};