import React, { Component } from 'react';
import { connect } from 'react-redux';
import { basename } from 'path';
import { VALIDATOR, getTOMsStart, selectTOM, validateTOMStart } from 'actions/validator';
import { Grid, Row, Col, Clear, Card, Button, Dropdown } from 'components/bsComponents';
import ProgressBar from 'components/Validator/ProgressBar';

const ResultEntry = ({ error: { message, expected, actual } }) => (
	<React.Fragment>
		<h5 className="alert-heading text-dark">{message}</h5>
		{
			(expected || actual)
				? (
					<Grid>
						<Row>
							<Col col={1} xClass="pl-0">
								{expected ? <p className="text-dark nowrap mb-0"><strong>Expected:</strong></p> : null}
								{actual ? <p className="text-dark nowrap my-0"><strong>Actual:</strong></p> : null}
							</Col>
							<Col col={11}>
								{expected ? <p className="text-dark mb-0">{expected}</p> : null}
								{actual ? <p className="text-dark my-0">{actual}</p> : null}
							</Col>
						</Row>
					</Grid>
				)
				: null
		}
	</React.Fragment>
	// message, expected, actual
);

const ResultCategory = ({ type, errors }) => (
	<div className="alert alert-danger">
		<h4 className="alert-heading text-dark">{type}</h4>
		{
			errors.map((error, i) => (
				<React.Fragment key={`rescat-frag-${i}`}>
					<hr key={`hr${i}`}/>
					<ResultEntry error={error} key={`result-entry-${i}`} />
				</React.Fragment>
			))
		}
	</div>
);

const PageResults = ({ filename, pageResults }) => {
	const entries = Object.entries(pageResults);
	if (entries.length > 0) {

		return (
			<Card header={basename(filename)} xClass="mt-2">
				{
					entries.map(([type, errors], i) => (
						<ResultCategory key={`err-cat-${i}`} type={type} errors={errors} />
					))
				}
			</Card>
		);
	}
	else return null;
};

const ResultsEntries = ({ results }) => (
	<React.Fragment>
		{
			Object.entries(results)
				.map(([ filename, pageResults ], i) => (
					<PageResults filename={basename(filename)} pageResults={pageResults} key={`results-${i}`} />
				))
		}
	</React.Fragment>
);

class Validator extends Component {
	async componentDidMount() {
		//this.props.mockSetTOMs(); // sets toms and selects 40(10)5&6
		await this.props.getTOMsStart();
	}

	render() {
		const tomsList = this.props.toms;
		const resultKeys = Object.keys(this.props.results);
		const resultsNotEmpty = resultKeys.length > 0;

		const numResults = !resultsNotEmpty
			? 0
			: Object.values(this.props.results)
				.reduce(
					(acc, pageResult) =>
						acc + Object.values(pageResult).reduce(
							(acc, checkResult) => acc + checkResult.length,
							0,
						),
					0,
				);

		return (
			<Grid fluid xClass="mt-3">
				<Row>
					<Col md={11} col={12} xClass="mx-auto mb-3 py-3 border border-secondary rounded">
						<h2>Selected TOM: {this.props.selectedTOM || 'None'}</h2>
						<div className="btn-toolbar mt-3 mb-2 mw-75">
							<Dropdown items={tomsList}
							          click={this.props.selectTOM}
							          label={this.props.selectedTOM || 'Select manual to validate'}
							          xClass="w-25"
							/>
							<Button bsClass="primary" xClass="ml-2" click={() => this.props.validateTOMStart()} text="Validate TOM" />
						</div>
						<hr />
						{
							this.props.progressStatus
								? <p>{this.props.progressStatus}</p>
								: null
						}
						{
							resultsNotEmpty
								? <p className="my-2"><strong className="text-danger">{`${numResults} errors found`}</strong></p>
								: null
						}
						<p className="my-2">{this.props.fileCount || 0} total files</p>
						<ProgressBar percent={this.props.progress}/>
					</Col>
					<Clear />
				</Row>
				<Row>
					<Col md={11} col={12} xClass={`mx-auto ${resultsNotEmpty && ' border border-secondary rounded'}`}>
						{
							resultsNotEmpty
								? <ResultsEntries results={this.props.results}/>
								: null
						}
					</Col>
				</Row>
			</Grid>
		);
	}
}

const mapState = ({ validator }) => (validator);

const mapDispatch = {
	getTOMsStart,
	selectTOM,
	validateTOMStart,
};

export default connect(mapState, mapDispatch)(Validator);