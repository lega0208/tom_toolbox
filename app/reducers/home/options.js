import { combineReducers } from 'redux';

//const homeOptions = sessionStorage.getItem('home.options'); // fix sessionStorage
const defaultState = {
	initScriptsState: {
		autoAcro: true,
		specChars: true,
		supNbsp: true,
		images: true,
	},
	initConverterState: {
		lang: 'en',
		wetVersion: 2,
	},
};
const { initScriptsState, initConverterState } = defaultState;

function scripts(state = initScriptsState, action) {
	switch (action.type) {
		case 'TOGGLE_AUTOACRO': return toggleState('autoAcro');
		case 'TOGGLE_SPECCHARS': return toggleState('specChars');
		case 'TOGGLE_SUPNBSP': return toggleState('supNbsp');
		case 'TOGGLE_IMAGES': return toggleState('images');
		default: return state;
	}

	function toggleState(propName) {
		return {
			...state,
			[propName]: !state[propName],
		}
	}
}

function converter(state = initConverterState, action) {
	switch (action.type) {
		case 'SET_LANG': return mergeState('lang');
		case 'SET_WETVERSION': return mergeState('wetVersion');
		default: return state;
	}

	function mergeState(propName) {
		return {
			...state,
			[propName]: action.payload,
		}
	}
}

export default combineReducers({
	scripts,
	converter,
});