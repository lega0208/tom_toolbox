import React, { Component } from 'react';
// import Loading from '../../Loading.js';
import { mergeAcroMap } from '../../../actions/home/autoAcro';

export default class DupsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toRender: [],
      dupChoices: {},
			defSelections: {},
    };
    this.handleChoiceClick = this.handleChoiceClick.bind(this);
  }

  render() {
		let renderArr = [];
		if (this.props.dupsMap) {
			for (const [acro, defs] of Object.entries(this.props.dupsMap)) {
				renderArr.push(<DefList acro={acro} defs={defs} defSelections={this.state.defSelections} key={acro + '-defs'} handleChoiceClick={this.handleChoiceClick}/>);
			}
		}
		const DefLists = () => <div>{renderArr.length > 0 ? renderArr : 'error'}</div>;

    return <div><DefLists /></div>;
  }

  async handleChoiceClick(e) {
    const choice = e.target;
    const acro = choice.getAttribute('data-acro');
    const def = choice.getAttribute('data-def');

    await this.setState(state => ({
			dupChoices: {
				...state.dupChoices,
				[acro]: def
			},
			defSelections: {
				...state.defSelections,
				[acro]: def
			}
    }));
    await this.props.dispatch(mergeAcroMap({[acro]: def}));
  }
}

function DefList(props) {
  const acro = props.acro;
  const defs = props.defs;
  const header = [<li className="list-group-item list-group-item-info list-group-item-heading h5 mb-0" key={acro + '-header'}>{acro}</li>];
  const listClasses = def => 'list-group-item btn-outline-info' + (props.defSelections[acro] === def ? ' active' : '');
  const list = defs.map(def => <li className={listClasses(def)}
																	 key={def}
																	 data-def={def}
																	 data-acro={acro}
																	 onClick={props.handleChoiceClick}>{getDef(def)}</li>);

  return (<ul className="list-group mb-2">{header.concat(list)}</ul>)
}

function getDef(def) {
  return /<abbr title="(.+?)">.+?<\/abbr>/.exec(def)[1];
}
