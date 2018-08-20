import React from 'react';

const Warning = (props) => (
	<div className="row mt-2">
		<div className="col-auto" />
		<div className="col">
			<div className={`alert alert-warning fade ${props.show ? 'show' : 'hide'}`} role="alert">
				<h5>Warning:</h5>
				{
					props.error
						? <p className="my-1 text-danger"><strong>{props.error.replace('Error: ', '')}</strong></p>
						: null
				}
				<p className="mb-1">{props.message}</p>
			</div>
		</div>
		<div className="col-auto" />
	</div>
);

export default function Alert(props) {
	const type = props.type;
	const title =
		type === 'danger' ? 'Error' :
			type === 'warning' ? 'Warning' :
				type === 'success' ? 'Success!' : '';
	const message = type === 'success' ? 'Result has been copied to your clipboard.' : props.message;
	const display = props.show ? 'show' : 'hide';
	console.log(type);
	return (
		<div className="container mb-5">
			{
				props.warning.show ? <Warning {...props.warning} /> : null
			}
			{
				props.show ? (
					<div className="row position-fixed">
						<div className="col-auto" />
						<div className="col">
							<div className={`mb-1 mt-2 px-3 py-2 alert alert-${type} fade ${display}`} role="alert">
								<h3 className="alert-heading mt-0">{title}</h3>
								<p className="mb-0">
									{message}
								</p>
							</div>
						</div>
						<div className="col-auto" />
					</div>
				) : null
			}
		</div>
	);
};