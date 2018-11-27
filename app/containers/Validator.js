import React, { Component } from 'react';
import { connect } from 'react-redux';
import { basename } from 'path';
import { getTOMsStart, selectTOM, validateTOMStart } from 'actions/validator';
import {
	Grid,
	Row,
	Col,
	Clear,
	Button,
	Dropdown,
	LoadingSpinner,
	ListGroup,
	ListGroupItem,
	Checkbox,
} from 'components/bsComponents';
import {
	ProgressBar,
	PageResults,
	ValidationFilters,
} from 'components/Validator';

const ResultsEntries = ({ results, validationFilters }) => {
	try {
		const filteredResults =
			results.map(
				(pageResults) => ({
					path: pageResults.path,
					results: pageResults.results
						.filter(({ title }) => !validationFilters.includes(title))
				})
			)
				.filter((pageResults) => pageResults.results.length > 0);

		return (
			<React.Fragment>
				{
					filteredResults.map(({ path, results }, i) => (
						<PageResults
							filename={basename(path)}
							pageResults={results}
							key={`results-${i}`}
						/>
					))
				}
			</React.Fragment>
		);
	} catch (e) {
		console.error('probably can\'t filter results?');
		console.error(results);
		console.error(e);
	}
};

const Results = ({ results, validationFilters }) => (
	<React.Fragment>
		{
			results.length > 0
				? <ResultsEntries results={results} validationFilters={validationFilters} />
				: null
		}
	</React.Fragment>
);

class Validator extends Component {
	async componentDidMount() {
		//this.props.mockSetTOMs();
		//this.props.setMockResults();
		await this.props.getTOMsStart();
	}

	render() {
		const tomsList = this.props.toms;
		const resultsNotEmpty = this.props.results.length > 0;

		return (
			<Grid fluid xClass="mt-3">
				<Row xClass="position-static border border-secondary rounded m-1 py-2">
					<Col col={2}>
						<ValidationFilters />
					</Col>
					<Col md={9} col={10} xClass="mb-3 py-3">
						<h2>Selected TOM: {this.props.selectedTOM || 'None'}</h2>
						<div className="btn-toolbar mt-3 mb-2 mw-75">
							<Dropdown items={tomsList}
							          click={this.props.selectTOM}
							          label={this.props.selectedTOM || 'Select manual to validate'}
							          xClass="w-25"
							/>
							<Button bsClass="primary"
							        xClass="ml-2"
							        click={() => this.props.selectedTOM && this.props.validateTOMStart()}
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
						<p className="my-2">{this.props.fileCount || 0} total files</p>
						{
							this.props.progressStatus
								? <p>{this.props.progressStatus}</p>
								: null
						}
						{
							resultsNotEmpty
								? <p className="my-2"><strong className="text-danger">{`${this.props.numErrors} errors found`}</strong></p>
								: null
						}
						<ProgressBar percent={this.props.progress}/>
						<Results results={this.props.results} validationFilters={this.props.validationFilters} />
					</Col>
					<Clear />
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
