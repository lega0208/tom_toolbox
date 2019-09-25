import React from 'react';
import { connect } from 'react-redux';
import { Checkbox, Col, Grid, ListGroup, ListGroupItem, Row, TextInput } from 'components/bsComponents';
import { addFilter, removeFilter, setSearchFilter } from 'actions/validator';

const FilterCheckbox = ({ title, addFilter, removeFilter, validationFilters }) => {
	const isChecked = !validationFilters.includes(title);
	const checkChange = (e) => {
		if (!e.target.checked) {
			addFilter(title);
		} else if (e.target.checked) {
			removeFilter(title);
		}
	};

	return (
		<Checkbox label={title} value={title} change={checkChange} checked={isChecked} />
	);
};
const SearchFilter = ({ filterSearchText, setSearchFilter }) => (
	<TextInput label="Filename search"
	           placeholder="Enter search text"
	           value={filterSearchText}
	           change={setSearchFilter} />
);
const mapSearchState = ({ validator: { filterSearchText } }) => ({ filterSearchText });
const ConnectedSearchFilter = connect(mapSearchState, { setSearchFilter })(SearchFilter);

const mapFiltersState = ({ validator: { validationFilters } }) => ({ validationFilters });
const mapDispatch = { addFilter, removeFilter };
const ConnectedFilterCheckbox = connect(mapFiltersState, mapDispatch)(FilterCheckbox);

export default () => (
	<ListGroup>
		<ListGroupItem xClass="list-group-item-secondary">
			<h6 className="mb-0">Filters</h6>
		</ListGroupItem>
		<ListGroupItem xClass="p-1 p-md-2">
			<Grid>
				<Row>
					<Col col={6} xClass="px-0">
						<ConnectedFilterCheckbox title="Title" />
						<ConnectedFilterCheckbox title="Date" />
						<ConnectedFilterCheckbox title="Language link" />
						<ConnectedFilterCheckbox title="Breadcrumbs" />
					</Col>
					<Col col={6} xClass="px-0">
						<ConnectedFilterCheckbox title="Section menu" />
						<ConnectedFilterCheckbox title="Navigation buttons" />
						<ConnectedFilterCheckbox title="Table of contents" />
						<ConnectedFilterCheckbox title="Links" />
					</Col>
				</Row>
			</Grid>
		</ListGroupItem>
		<ListGroupItem xClass="pt-1 px-2">
			<ConnectedSearchFilter />
		</ListGroupItem>
	</ListGroup>
);