import React from 'react';

export default function Alert(props) {
	const warning = props.warning || undefined;
	const type = props.type;
	const title = type === 'danger' ? 'Error' : 'Success!';
	const message = props.error || 'Result has been copied to your clipboard.';
	const display = props.show ? 'show' : 'hide';

	return (
		<div className={'container' + ((!warning.message) ? ' mb-5' : '')}>
			{
				warning.message ? (
					<div className="row mt-2">
						<div className="col-auto" />
						<div className="col">
							<div className={`alert alert-warning fade ${warning.show ? 'show' : 'hide'}`} role="alert">
								<h5>Warning:</h5>
								{
									warning.error ? <p className="my-1 text-danger">{warning.error}</p> : null
								}
								<p className="mb-1">{warning.message}</p>
							</div>
						</div>
						<div className="col-auto" />
					</div>
				) : <div className="row mt-2"><div className="col" /></div>
			}
			{
				props.show ? (
					<div className="row position-fixed">
						<div className="col-auto" />
						<div className="col">
							<div className={`mb-1 mt-2 px-3 py-2 alert alert-${type} fade ${display}`} role="alert">
								<h3 className="alert-heading mt-0">{title}</h3>
								<p className="mb-0">{message}</p>
							</div>
						</div>
						<div className="col-auto" />
					</div>
				) : null
			}
		</div>
	);
};