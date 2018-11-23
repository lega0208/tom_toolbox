import React, { Component } from 'react';
import { connect } from 'react-redux';
import { basename } from 'path';
import { VALIDATOR, getTOMsStart, selectTOM, validateTOMStart } from 'actions/validator';
import { Grid, Row, Col, Clear, Card, Button, Dropdown, LoadingSpinner } from 'components/bsComponents';
import ProgressBar from 'components/Validator/ProgressBar';

const ResultEntry = ({ error: { message, additionalMessages = [] } }) => (
	<React.Fragment>
		<h5 className="alert-heading text-dark">{message}</h5>
		{
			(additionalMessages.length > 0) ? (
				<Grid>
					{
						additionalMessages.map((msg, i) => (
							<Row key={`addit-msg-row-${i}`}>
								<Col key={`addit-msg-col1-${i}`} col={4} xClass="pl-0">
									<p key={`addit-msg-p1-${i}`} className="text-dark text-right nowrap my-0"><strong>{msg.header || ''}</strong></p>
								</Col>
								<Col key={`addit-msg-col2-${i}`} col={8}>
									<p key={`addit-msg-p2-${i}`} className="text-dark my-0">
										{
											typeof msg === 'object' ? msg.message : msg
										}
							    </p>
								</Col>
							</Row>
						))
					}
				</Grid>
			) : null
		}
	</React.Fragment>
	// message, expected, actual
);

const ResultCategory = ({ title, errors }) => (
	<div className="alert alert-danger">
		<h4 className="alert-heading text-dark">{title}</h4>
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
	if (pageResults.length > 0) {
		return (
			<Card header={basename(filename)} xClass="mt-2">
				{
					pageResults.map(({ title, errors }, i) => (
						<ResultCategory key={`err-cat-${i}`} title={title} errors={errors} />
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
			results.map(({ path, results }, i) => (
				<PageResults filename={basename(path)} pageResults={results} key={`results-${i}`} />
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
		const resultsNotEmpty = this.props.results.length > 0;

		const numResults = !resultsNotEmpty
			? 0
			: this.props.results
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
				<Row xClass="position-static">
					<Col md={11} col={12} xClass="mx-auto mb-3 py-3 border border-secondary rounded">
						<h2>Selected TOM: {this.props.selectedTOM || 'None'}</h2>
						<div className="btn-toolbar mt-3 mb-2 mw-75">
							<Dropdown items={tomsList}
							          click={this.props.selectTOM}
							          label={this.props.selectedTOM || 'Select manual to validate'}
							          xClass="w-25"
							/>
							<Button bsClass="primary"
							        xClass="ml-2"
							        click={() => this.props.validateTOMStart()}
							        text="Validate TOM"
							        disabled={this.props.toms.length === 0 || this.props.verifyingCache}
							/>
							{
								(this.props.toms.length === 0 || this.props.verifyingCache)
									? <LoadingSpinner xClass="ml-2 mt-2" />
									: null
							}
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