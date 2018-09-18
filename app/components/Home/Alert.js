import React from 'react';

const Warning = (props) => (
	<div className="row mt-2">
		<div className="col-auto" />
		<div className="col">
			<div className={`alert alert-danger fade ${props.show ? 'show' : 'hide'}`} role="alert">
				{
					props.error
						? (
							<p className="my-1">
								<span className="h5 text-danger">Error:</span> {props.error.replace('Error: ', '')}
							</p>
						)
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
	const message = props.message;
	const display = props.show ? 'show' : 'hide';

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