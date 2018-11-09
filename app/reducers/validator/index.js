import { VALIDATOR } from 'actions/validator';

const initialState = {
	selectedTOM: '',
	tomsLoaded: false,
	toms: [],
	results: {},
	error: '',
	fileCount: 0,
	progress: 0,
	progressStatus: '',
};

function validator(state = initialState, action) {
	switch (action.type) {
		case VALIDATOR.GET_TOMS.START: return initialState;
		case VALIDATOR.GET_TOMS.SUCCESS: return { ...state, toms: action.payload, tomsLoaded: true };
		case VALIDATOR.GET_TOMS.ERROR: return { ...initialState, error: action.payload, };
		case VALIDATOR.SELECT.TOM:
			return { ...state, selectedTOM: action.payload, fileCount: 0, progress: 0, results: {}, progressStatus: '' };
		case VALIDATOR.SET.RESULTS: return { ...state, results: action.payload };
		case VALIDATOR.SET.FILECOUNT: return { ...state, fileCount: action.payload };
		case VALIDATOR.PROGRESS.SET: return { ...state, progress: action.payload };
		case VALIDATOR.PROGRESS.UPDATE:
			const percentDone = state.fileCount === 0
				? 100
				: Math.round((action.payload / state.fileCount) * 100);
			return { ...state, progress: percentDone };
		case VALIDATOR.PROGRESS.RESET: return { ...state, progress: 0 };
		case VALIDATOR.PROGRESS.SET_STATUS: return { ...state, progressStatus: action.payload };
		case VALIDATOR.VALIDATE_TOM.START: return { ...state, progress: 0, results: {} };
		case VALIDATOR.VALIDATE_TOM.SUCCESS: return { ...state, progress: 100 };
		case VALIDATOR.VALIDATE_TOM.ERROR: return { ...state, results: [], error: action.payload };
		// add SELECT_CHAPTER

		default: return state;
	}
}

export default validator;