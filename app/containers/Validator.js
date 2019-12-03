import React, { Component } from 'react';
import { connect } from 'react-redux';
import { basename } from 'path';
import { getTOMsStart, selectTOM, validateTOMStart } from 'actions/validator';
import {
	Grid,
	Row,
	Col,
	Button,
	Dropdown,
	LoadingSpinner,
} from 'components/bsComponents';
import {
	ProgressBar,
	PageResults,
	ValidationFilters,
} from 'components/Validator';

const ResultsEntries = ({ results, validationFilters, filterSearchText }) => {
	try {
		const filteredResults =
			results
				.filter(
					({ results, path }) =>
						results.length > 0 && (filterSearchText ? basename(path).includes(filterSearchText) : true)
				)
				.map((pageResults) => ({
					path: pageResults.path,
					results: pageResults.results
				})
			);

		return (
			<React.Fragment>
				{
					filteredResults.map(({ path, results }, i) => (
						<PageResults
							filename={basename(path)}
							pageResults={results}
							validationFilters={validationFilters}
							key={`results-${i}`}
						/>
					))
				}
			</React.Fragment>
		);
	} catch (e) {
		console.error(e);
	}
};

const Results = ({ results, validationFilters, filterSearchText }) => (
	<Row xClass="position-relative" xStyle={{top: '300px'}}>
		<Col col={12}>
			{
				results.length > 0
					? <ResultsEntries results={results}
					                  validationFilters={validationFilters}
					                  filterSearchText={filterSearchText} />
					: null
			}
		</Col>
	</Row>
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
			<Grid fluid>
				<Row xClass="fixed-top border border-secondary rounded m-3 py-1"
				     xStyle={{top: '58px', backgroundColor: 'white'}}>
					<Col col={7} xClass="py-3">
						<h2>Selected TOM: {this.props.selectedTOM || 'None'}</h2>
						<div className="btn-toolbar mt-3 mb-2 mw-75">
							<Dropdown items={tomsList}
							          click={this.props.selectTOM}
							          label={this.props.selectedTOM || 'Select manual'}
							/>
							<Button bsClass="primary"
							        xClass="ml-2"
							        click={() => this.props.selectedTOM && this.props.validateTOMStart()}
							        text="Check for errors"
							        disabled={this.props.toms.length === 0 || this.props.verifyingCache}
							/>
							{
								(this.props.toms.length === 0 || this.props.verifyingCache)
									? <LoadingSpinner xClass="ml-2 mt-2" />
									: null
							}
						</div>
						<hr />
						<p className="my-1 pull-left">{this.props.fileCount || 0} total files</p>
						{
							this.props.progressStatus === 'Validation complete:'
								? resultsNotEmpty
									? <p className="my-1 pull-right"><strong className="text-danger">{`${this.props.numErrors} errors found`}</strong></p>
									: <p className="my-1 pull-right"><strong className="text-success">{`No errors found`}</strong></p>
								: null
						}
						<ProgressBar percent={this.props.progress}/>
					</Col>
					<Col sm={5} xClass="p-1">
						<ValidationFilters />
					</Col>
				</Row>
				<Results results={this.props.results}
				         validationFilters={this.props.validationFilters}
				         filterSearchText={this.props.filterSearchText} />
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
