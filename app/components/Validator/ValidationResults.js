import React from 'react';
import { Col, Grid, Row } from 'components/bsComponents';

const AdditionalMessage = ({ msg, i }) => (
	<Row key={`addit-msg-row-${i}`}>
		<Col key={`addit-msg-col1-${i}`} col={4} xClass="pl-0">
			<p key={`addit-msg-p1-${i}`} className="text-dark text-right nowrap my-0"><strong>{msg.header || ''}</strong></p>
		</Col>
		<Col key={`addit-msg-col2-${i}`} col={8}>
			<p key={`addit-msg-p2-${i}`} className="text-dark my-0">
				{
					/* msg can be an object (for header) or string */
					typeof msg === 'object' ? msg.message : msg
				}
			</p>
		</Col>
	</Row>
);

const ValidationError = ({ error: { message, additionalMessages = [] } }) => (
	<React.Fragment>
		<h5 className="alert-heading text-dark">{message}</h5>
		{
			(additionalMessages.length > 0) ? (
				<Grid>
					{
						additionalMessages
							.map((msg, i) => (
								<AdditionalMessage msg={msg} i={i} key={`additmsg-${i}`} />
							))
					}
				</Grid>
			) : null
		}
	</React.Fragment>
);

export default ({ title, errors }) => (
	<div className="alert alert-danger">
		<h4 className="alert-heading text-dark">{title}</h4>
		{
			errors.map((error, i) => (
				<React.Fragment key={`rescat-frag-${i}`}>
					<hr key={`hr${i}`}/>
					<ValidationError error={error} key={`result-entry-${i}`} />
				</React.Fragment>
			))
		}
	</div>
);
