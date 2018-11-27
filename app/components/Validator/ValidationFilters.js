import React from 'react';
import { connect } from 'react-redux';
import { Checkbox, ListGroup, ListGroupItem } from 'components/bsComponents';
import { addFilter, removeFilter } from 'actions/validator';

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
const mapState = ({ validator: { validationFilters } }) => ({ validationFilters });
const mapDispatch = { addFilter, removeFilter };
const ConnectedFilterCheckbox = connect(mapState, mapDispatch)(FilterCheckbox);

export default () => (
	<ListGroup>
		<ListGroupItem xClass="list-group-item-secondary">
			<h6 className="mb-0">Filters</h6>
		</ListGroupItem>
		<ListGroupItem xClass="p-2">
			<ConnectedFilterCheckbox title="Title" />
			<ConnectedFilterCheckbox title="Date" />
			<ConnectedFilterCheckbox title="Language link" />
			<ConnectedFilterCheckbox title="Breadcrumbs" />
			<ConnectedFilterCheckbox title="Section menu" />
			<ConnectedFilterCheckbox title="Navigation buttons" />
			<ConnectedFilterCheckbox title="Table of contents" />
			<ConnectedFilterCheckbox title="Links" />
		</ListGroupItem>
	</ListGroup>
);