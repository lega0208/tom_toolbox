import React from 'react';
import { connect } from 'react-redux';

const Warning = ({ message, error, show }) => (
	<div className="row mt-2">
		<div className="col-auto" />
		<div className="col">
			<div className={`alert alert-danger fade ${show ? 'show' : 'hide'}`} role="alert">
				{
					error ? (
						<p className="my-1">
							<span className="h5 text-danger">Error:</span> {error.replace('Error: ', '')}
						</p>
					) : null
				}
				<p className="mb-1">{message}</p>
			</div>
		</div>
		<div className="col-auto" />
	</div>
);

function Alert({ alert, warning }) {
	const type = alert.type;
	const title =
		type === 'danger' ? 'Error' :
			type === 'warning' ? 'Warning' :
				type === 'success' ? 'Success!' : '';
	const message = alert.message;
	const display = alert.show ? 'show' : 'hide';
	const emoji =
		type === 'success'
			? ' 😃'
			: type === 'danger'
				? ' 😧'
				: '';

	return (
		<div className="container mb-5">
			{ warning.show ? <Warning {...warning} /> : null }
			{
				alert.show ? (
					<div className="row position-fixed">
						<div className="col-auto" />
						<div className="col">
							<div className={`mb-1 mt-2 px-3 py-2 alert alert-${type} fade ${display}`} role="alert">
								<h3 className="alert-heading mt-0">{title + emoji}</h3>
								<p className="mb-0">{message}</p>
							</div>
						</div>
						<div className="col-auto" />
					</div>
				) : null
			}
		</div>
	);
}

const mapState = ({ home: { alert, warning } }) => ({ alert, warning });

export default connect(mapState)(Alert);
