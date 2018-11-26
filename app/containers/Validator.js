import React, { Component } from 'react';
import { connect } from 'react-redux';
import { basename } from 'path';
import { getTOMsStart, selectTOM, validateTOMStart } from 'actions/validator';
import {
	Grid,
	Row,
	Col,
	Clear,
	Card,
	Button,
	Dropdown,
	LoadingSpinner,
} from 'components/bsComponents';
import {
	ProgressBar,
	PageResults,
} from 'components/Validator';

const ResultsEntries = ({ results, validationFilters }) => (
	<React.Fragment>
		{
			results.map(({ path, results }, i) => (
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

const Results = ({ results }) => (
	<Row>
		<Col
			md={11}
			col={12}
			xClass={`mx-auto ${results.length > 0 ? ' border border-secondary rounded' : ''}`}
		>
			{
				results.length > 0
					? <ResultsEntries results={this.props.results} />
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
				<Results />
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
