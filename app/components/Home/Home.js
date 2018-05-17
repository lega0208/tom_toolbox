import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clipboard } from 'electron';

import ModalPreview from './HTMLPreview';
import CodeView from './CodeView';
import Alert from "./Alert";
import TopButtonRow from './TopButtonRow'
import BottomButtonRow from './BottomButtonRow';
import FindAcronyms from './FindAcrosModal'; // for now

import cacheCheck from '../../database/cacheCheck';
import convertWord from '../../actions/wordConverter';
import {
	setTextContent,
	fireAlert,
	undo,
} from '../../actions/home';

import Loadable from '../Loadable.js';
import ScriptsBar from "./ScriptsBar";

class Home extends Component {
  constructor(props) {
    super(props);

    this.initListeners();
		this.listeners = [
			this.pasteListener,
			this.copyListener,
			this.undoListener,
		];
  }
  copy(toCopy) {
    try {
    	console.log(clipboard.availableFormats('text/html'));
      clipboard.writeText(toCopy);

			this.props.dispatch(setTextContent(toCopy));
      this.props.dispatch(fireAlert());
    } catch(e) {
			this.props.dispatch(fireAlert(e));
    }
  }

	undo() {
  	clipboard.writeText(this.props.state.priorText);
  	this.props.dispatch(undo());
	}

  componentDidMount() {
		this.configListeners('add', this.listeners);

		// todo: write .dbpath if none is found
		cacheCheck().then(() => console.log('Done checking cache'))
								.catch(e => console.error('Error in cacheCheck():\n' + e));
  }

  render() {
    const textContent = this.props.state.textContent;
    const opts = this.props.options;
		// const FindAcronyms = Loadable({loader: () => import('./FindAcrosModal'), hide: true});
    return (
      <div>
        <Alert {...this.props.alert} />
	      <div className="container-fluid">
		      <div className="row">
			      <div className="col-10 pr-1">
				      <TopButtonRow listType={opts.listType}
				                    lang={opts.lang}
				                    wetVersion={opts.wetVersion}
				                    dispatch={this.props.dispatch}/>
				      <CodeView content={textContent}/>
				      <BottomButtonRow convert={() => convertWord()} />
			      </div>
			      <ScriptsBar dispatch={this.props.dispatch} state={opts} />
		      </div>
	      </div>
        <ModalPreview modalTitle="Preview" modalId="preview" modalText={textContent}/>
        <FindAcronyms modalTitle="Select acronyms to replace:" modalId="acronyms" clipboard={this.props.state.clipboard}/>
      </div>
    );
  }

  /*
   * Housekeeping
   */
  componentWillUnmount() {
		this.configListeners('remove', this.listeners);
		this.setStorage();
  }
  setStorage() {
		const persistedSubstates = [
			'options',
			'state'
		];

		persistedSubstates.forEach((prop) => {
  		localStorage.setItem(`home.${prop}`, JSON.stringify(this.props[prop]));
		});
	}
	initListeners() {
		this.pasteListener = e => e.ctrlKey && e.key === 'v'
			? this.props.dispatch(convertWord())
			: null;
		this.copyListener = e => e.ctrlKey && e.key === 'c'
			? this.copy(this.props.state.textContent)
			: null;
		this.undoListener = e => e.ctrlKey && e.key === 'z'
			? this.undo()
			: null;
	}
	configListeners(operation, listeners) {
		if (operation === 'add') {
			listeners.forEach(listener => window.addEventListener('keydown', listener));
		} else if (operation === 'remove') {
			listeners.forEach(listener => window.removeEventListener('keydown', listener));
		}
	}
}

const mapStateToProps = ({ home }) => home;
export default connect(mapStateToProps)(Home);