import React from 'react';
import Home from '../components/Home/Home';
import { Grid, Col, Row } from 'components/bsComponents';
import { version } from '../../package.json';

export default function HomePage() {
	return (
		<Grid fluid>
			<Row>
				<Col md={11} col={12} xClass="mx-auto">
					<Home />
				</Col>
				<p className="text-right small fixed-bottom mr-2">Version {version}</p>
			</Row>
		</Grid>
	);
}
