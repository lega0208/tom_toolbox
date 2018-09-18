import { combineReducers } from 'redux';
import options from './options';
import { alert, warning } from './alert';
import autoAcro from './autoAcro';
import images from './images';

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
		case 'SET_WORDCONVERT': return { ...state, text: action.payload, }; // Do I need this one?
		default: return state;
	}
}

const initModalState = { display: null, screen: null, show: false };
function modal(state = initModalState, action) {
	try {
		switch (action.type) {
			case 'MODAL_TRIGGER_SHOW': // This action triggers a side-effect which shows the modal w/ jQuery
				return { ...state, ...action.payload, };
			case 'MODAL_TRIGGER_HIDE':
				return initModalState; // This action triggers a side-effect which hides the modal w/ jQuery
			case 'MODAL_SET':
				return { ...state, ...action.payload };
			case 'MODAL_SET_DISPLAY':
				return { ...state, display: action.payload };
			case 'MODAL_SET_SCREEN':
				return { ...state, screen: action.payload };
			case 'MODAL_SHOW':
				return { ...state, show: true };
			case 'MODAL_HIDE':
				return { ...state, show: false };
			case 'MODAL_CLEAR':
				return initModalState;
			default:
				return state;
		}
	} catch (e) {
		console.error(e);
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