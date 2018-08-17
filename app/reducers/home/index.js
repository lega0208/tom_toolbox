import { combineReducers } from 'redux';
import options from './options';
import alert from './alert';

const initialHomeState = {
		clipboard: '',
		textContent: '',
		priorText: '',
	};

function state(state = initialHomeState, action) {
	const mergeState = (propName, replaceVal) => ({
		...state,
		[propName]: replaceVal || action.payload,
	});

	switch (action.type) {
		case 'SET_CLIPBOARD': return mergeState('clipboard');
		case 'SET_PRIORTEXT': return mergeState('priorText');
		case 'SET_TEXTCONTENT': return {
			...state,
			textContent: action.payload,
			priorText: state.textContent
		};
		case 'UNDO': return {
			...state,
			textContent: state.priorText,
			priorText: state.textContent
		};
		default: return state;
	}
}

function wordConvert(state = '', action) {
	switch (action.type) {
		case 'SET_WORDCONVERT': return action.payload;
		case 'RESET_WORDCONVERT': return '';
		default: return state;
	}
}

export default combineReducers({
	options,
	alert,
	state,
	wordConvert
});