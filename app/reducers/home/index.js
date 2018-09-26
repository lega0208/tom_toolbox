import { combineReducers } from 'redux';
import options from './options';
import { alert, warning } from './alert';
import autoAcro from './autoAcro';
import images from './images';
import modal from './modal';

function clipboard(state = '', action) {
	switch (action.type) {
		case 'SET_CLIPBOARD': return action.payload;
		default: return state;
	}
}

function textBox(state = { content: '', priorText: '' }, action) {
	switch (action.type) {
		case 'SET_TEXTCONTENT': return {
			content: action.payload,
			priorText: state.content
		};
		case 'UNDO': return {
			content: state.priorText,
			priorText: state.content
		};
		default: return state;
	}
}

function wordConvert(state = { text: '', status: 'waiting' }, action) {
	switch (action.type) {
		case 'WORDCONVERT_INIT': return { ...state, status: 'started', };
		case 'WORDCONVERT_END': return { text: '', status: 'waiting', };
		case 'WORDCONVERT_ERROR': return { text: '', status: 'waiting', }; // Alternative to END
		default: return state;
	}
}

function scripts(state = { running: false, text: '' }, action) {
	switch (action.type) {
		case 'SCRIPTS_START': return { running: true, text: action.payload };
		case 'SCRIPTS_SET_TEXT': return { running: state.running, text: action.payload };
		case 'SCRIPTS_END': return { running: false, text: '' };
		default: return state;
	}
}

export default combineReducers({
	options,
	alert,
	warning,
	textBox,
	clipboard,
	wordConvert,
	autoAcro,
	images,
	modal,
	scripts,
});