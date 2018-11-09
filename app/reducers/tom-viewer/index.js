//import { combineReducers } from 'redux';
import { TOMVIEWER } from 'actions/tom-viewer';

const initialData = {
	title: '',
	filename: '',
	lang: '',       // not really necessary?
	wetVersion: 2,  // ?
	metadata: {
		isHomepage: '',
		manualdId: '',
		manualName: '',
		description: '',
		keywords: '',
		creator: '',
		publisher: '',
		issueDate: '',
		modifiedDate: '',
	},
	langLink: '',
	breadcrumbs: [],
	nav: {
		prevPage: '',
		homePage: '',
		nextPage: '',
	},
	toc: [],
	secMenu: [],
};

const initialState = {
	selectedPage: '',
	loaded: false,
	data: initialData,
	error: '',
};

function tomViewer(state = initialState, action) {
	switch (action.type) {
		case TOMVIEWER.SELECT.FILE:       return { ...state, selectedPage: action.payload };
		case TOMVIEWER.SET.DATA:          return { ...state, data: action.payload };
		case TOMVIEWER.LOAD_FILE.START:   return { ...state, loaded: false };
		case TOMVIEWER.LOAD_FILE.SUCCESS: return { ...state, loaded: true };
		case TOMVIEWER.LOAD_FILE.ERROR:   return { ...state, loaded: false, error: action.payload };

		default: return state;
	}
}

export default tomViewer;

//export default combineReducers({
//	tomViewer,
//});