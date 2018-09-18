import React, { Component } from 'react';
import { connect }          from 'react-redux';

import CodeView        from './CodeView';
import Alert           from './Alert';
import TopButtonRow    from './TopButtonRow'
import ScriptsBar      from './ScriptsBar';
import BottomButtonRow from './BottomButtonRow';
import HomeModal       from './Modal';

import convertWord                         from 'actions/home/wordConverter';
import { setTextContent, undo } from 'actions/home';
import { setWarning, hideWarning }         from 'actions/home/alert';
import cacheCheck                          from 'database/cacheCheck';

// const { Menu, MenuItem } = remote;

class Home extends Component {
  constructor(props) {
    super(props);

		this.keydown = this.keydown.bind(this);
  }
  copy(toCopy) {
    // todo
  }

  paste() {
		//this.props.dispatch(convertWord());
	  this.props.dispatch({ type: 'WORDCONVERT_INIT' }); // todo: make action creator
	}

	undo() {
  	this.props.dispatch(undo());
	}

	keydown(e) {
  	if (e.ctrlKey) {
  		switch (e.key) { // todo: change behavior based on state ("modal.show === false", or other stuff)
				case 'v': this.paste(); break;
				case 'c': this.copy(this.props.textBox.content); break;
				case 'z': this.undo(); break;
			}
		}
	}

  componentDidMount() {
		this.elemRef.focus(); // Do I still need this?

		setTimeout(async () => { // todo: move to sagas probably
			try {
				await cacheCheck();
				console.log('Done checking cache');
				this.props.dispatch(hideWarning());
			} catch (e) {
				const error = e.message.includes('cscript.exe error')
					? 'Error: Database connection could not be established.'
					: e.message;
				this.props.dispatch(setWarning({
					message: 'There was a problem connecting to the database. Please verify that you have the correct path. '
						+ 'Otherwise, try toggling the DB driver via File -> Toggle DB Driver.',
					error,
				}));
				console.error(e.message);
			}
		}, 250);
  }

  render() {
    const textContent = this.props.textBox.content;
	  const converterOpts = this.props.options.converter;
	  const scriptsOpts = this.props.options.scripts;

    return (
      <div id="home" ref={elem => this.elemRef = elem /* Do I need this ref? */} onKeyDown={this.keydown} tabIndex="-1">
        <Alert {...this.props.alert} warning={this.props.warning} />
	      <div className="container-fluid">
		      <div className="row">
			      <div className="col-9 pr-1">
				      <TopButtonRow listType={converterOpts.listType}
				                    lang={converterOpts.lang}
				                    wetVersion={converterOpts.wetVersion}
				                    dispatch={this.props.dispatch}/>
				      <CodeView content={textContent}/>
				      <BottomButtonRow convert={() => convertWord()} />
			      </div>
			      <ScriptsBar dispatch={this.props.dispatch} opts={scriptsOpts} />
		      </div>
	      </div>
	      <HomeModal />
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
			'options'
		];

		persistedSubstates.forEach((prop) =>
			sessionStorage.setItem(`home.${prop}`, JSON.stringify(this.props[prop]))); // does this even work?
	}
}

const mapStateToProps = ({ home }) => home;
export default connect(mapStateToProps)(Home);