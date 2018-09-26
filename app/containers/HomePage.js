import React from 'react';
import Home from '../components/Home/Home';
import { Grid, Col, Row, Clear } from 'components/bsComponents';

export default function HomePage() {
	return (
		<Grid fluid>
			<Row>
				<Col md={11} col={12} xClass="mx-auto">
					<Home />
				</Col>
			</Row>
			<Clear />
		</Grid>
	);
}
