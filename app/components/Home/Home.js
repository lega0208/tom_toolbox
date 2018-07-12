import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clipboard, remote } from 'electron';

import ModalPreview from './HTMLPreview';
import CodeView from './CodeView';
import Alert from './Alert';
import TopButtonRow from './TopButtonRow'
import ScriptsBar from './ScriptsBar';
import BottomButtonRow from './BottomButtonRow';
import FindAcronyms from './FindAcrosModal';
import ImageModal from './ImageModal';

import cacheCheck from '../../database/cacheCheck';
import convertWord from '../../actions/wordConverter';
import {
	setTextContent,
	fireAlert,
	undo,
} from '../../actions/home';
import { setWarning, hideWarning } from '../../actions/home/alert';

const { Menu, MenuItem } = remote;

class Home extends Component {
  constructor(props) {
    super(props);

		this.pasteListener = e => (e.ctrlKey && e.key === 'v') ? this.paste() : null;
		this.copyListener = e => (e.ctrlKey && e.key === 'c') ? this.copy(this.props.state.textContent) : null;
		this.undoListener = e => (e.ctrlKey && e.key === 'z') ? this.undo() : null;
		// this.listeners = [
		// 	this.pasteListener,
		// 	this.copyListener,
		// 	this.undoListener,
		// ];
		this.keydown = this.keydown.bind(this);
  }
  copy(toCopy) {
    try {
      clipboard.writeText(toCopy);

			this.props.dispatch(setTextContent(toCopy));
      this.props.dispatch(fireAlert());
    } catch(e) {
			this.props.dispatch(fireAlert(e));
    }
  }

  paste() {
		this.props.dispatch(convertWord());
	}

	undo() {
  	clipboard.writeText(this.props.state.priorText);
  	this.props.dispatch(undo());
	}

	keydown(e) {
  	if (e.ctrlKey) {
  		switch (e.key) {
				case 'v': this.paste(); break;
				case 'c': this.copy(); break;
				case 'z': this.undo(); break;
			}
		}
	}

  componentDidMount() {
		// this.configListeners('add', this.listeners);
		this.elemRef.focus();

		// todo: write .dbpath if none is found
		cacheCheck().then(() => {
			console.log('Done checking cache');
			this.props.dispatch(hideWarning());
		})
			.catch(e => {
				const error = e.message.includes('cscript.exe error')
					? 'Error: Database connection could not be established.'
					: e.message;
				this.props.dispatch(setWarning({
					message: 'There was a problem connecting to the database, please verify you have the correct path. '
						+ 'Otherwise, try toggling the DB driver.',
					error,
				}));
				console.error(e.message);
			});
  }

  render() {
    const textContent = this.props.state.textContent;
    const opts = this.props.options;
    return (
      <div ref={elem => this.elemRef = elem} onKeyDown={this.keydown} tabIndex="-1" style={{ minHeight: '91vh' }}>
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
        <ModalPreview modalTitle="Preview" modalId="preview" modalText={textContent} />
        <FindAcronyms modalTitle="Select acronyms to replace:"
											modalId="acronyms"
											clipboard={this.props.state.clipboard}
											/>
				<ImageModal />
      </div>
    );
  }

  /*
   * Housekeeping
   */
  componentWillUnmount() {
		// this.configListeners('remove');
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
	// configListeners(operation) {
	// 	if (operation === 'add') {
	// 		this.listeners.forEach(listener => document.body.addEventListener('keydown', listener));
	// 	} else if (operation === 'remove') {
	// 		this.listeners.forEach(listener => document.body.removeEventListener('keydown', listener));
	// 	}
	// 	if (process.env.NODE_ENV !== 'development') {
	// 		const contextMenu = new Menu();
	// 		contextMenu.append(new MenuItem({
	// 				label: 'Copy',
	// 				click: () => this.copy.bind(this)(this.props.state.textContent)
	// 			})
	// 		);
	// 		contextMenu.append(new MenuItem({
	// 				label: 'Paste',
	// 				click: this.paste.bind(this)
	// 			})
	// 		);
	// 		contextMenu.append(new MenuItem({
	// 				label: 'Undo',
	// 				click: this.undo.bind(this)
	// 			})
	// 		);
	// 		window.addEventListener('contextmenu', (e) => {
	// 			e.preventDefault();
	// 			contextMenu.popup({ window: remote.getCurrentWindow() });
	// 		}, false);
	// 	}
	// }
}

const mapStateToProps = ({ home }) => home;
export default connect(mapStateToProps)(Home);