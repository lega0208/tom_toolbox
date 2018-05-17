import { combineReducers } from 'redux';
import options from './options';
import alert from './alert';

const initialHomeState = localStorage.getItem('home.state')
	? {
			...JSON.parse(localStorage.getItem('home.state'))
		}
	: {
		clipboard: '',
		textContent: '',
		priorText: '',
	};

function state(state = initialHomeState, action) {
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

	function mergeState(propName, replaceVal) {
		return {
			...state,
			[propName]: replaceVal || action.payload,
		}
	}
}

export default combineReducers({
	options,
	alert,
	state,
});