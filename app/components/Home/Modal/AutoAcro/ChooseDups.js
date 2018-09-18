import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setDupsSelections } from 'actions/home/autoAcro';

class ChooseDups extends Component {
	constructor(props) {
		super(props);
		this.handleChoiceClick = this.handleChoiceClick.bind(this);
	}

	render() {
		const { dupsMap, dupsSelections } = this.props;

		return (
			<React.Fragment>
				{
					Object.entries(dupsMap).map(([ acro, defs ]) =>
						<DefList acro={acro}
						         defs={defs}
						         dupsSelections={dupsSelections}
						         key={acro + '-defs'}
						         handleChoiceClick={this.handleChoiceClick}
						/>
					)
				}
			</React.Fragment>
		);
	}

	async handleChoiceClick(e) {
		const choice = e.target;
		const acro = choice.getAttribute('data-acro');
		const def = choice.getAttribute('data-def');

		this.props.setDupsSelections({ [acro]: def });
	}
}

function DefList({ acro, defs, dupsSelections, handleChoiceClick }) {
	const header = [
		<li className="list-group-item list-group-item-info list-group-item-heading h5 mb-0"
		    key={acro + '-header'}>
			{acro}
		</li>
	];
	const listClasses = def => 'list-group-item btn-outline-info' + (dupsSelections[acro] === def ? ' active' : '');
	const list = defs.map(def => (
		<li className={listClasses(def)} key={def} data-def={def} data-acro={acro} onClick={handleChoiceClick}>
			{getDef(def)}
		</li>
	));

	return (<ul className="list-group mb-2">{header.concat(list)}</ul>)
}

function getDef(def) {
	return /<abbr title="(.+?)">.+?<\/abbr>/.exec(def)[1];
}

const mapState = ({ home: { autoAcro: { dupsMap, dupsSelections } } }) => ({ dupsMap, dupsSelections });
const mapDispatch = { setDupsSelections };

export default connect(mapState, mapDispatch)(ChooseDups);