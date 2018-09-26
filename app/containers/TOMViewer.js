import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadTomFile, selectTomFile } from 'actions/tom-viewer';
import { Grid, Row, Col, Clear } from 'components/bsComponents';
import DataView from 'components/TOMViewer/DataView';

const TOMViewerContent = ({ data, error }) => (
	<pre>
		{ error ? error : null }
		{ data ? JSON.stringify(data, null, 2) : null }
	</pre>
);

class TOMViewer extends Component {
	async componentDidMount() {
		await this.props.selectTomFile('C:\\Users\\myl061\\Desktop\\manuals\\TOM1921\\info_19(21)1-e.html');
		this.props.loadTomFile();
	}

	render() {
		return (
			<Grid fluid xClass="mt-3">
				<Row>
					<Col md={11} col={12} xClass="mx-auto">
						<DataView/>
					</Col>
					<Clear />
				</Row>
			</Grid>
		);
	}
}

const mapState = ({ tomViewer: { data, error, selectedPage } }) => ({ data, error, selectedPage });
const mapDispatch = {
	loadTomFile,
	selectTomFile,
};

export default connect(mapState, mapDispatch)(TOMViewer);