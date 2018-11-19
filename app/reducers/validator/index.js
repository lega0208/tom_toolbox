import { VALIDATOR } from 'actions/validator';

const initialState = {
	selectedTOM: '',
	tomsLoaded: false,
	toms: [],
	tomData: {},
	subchapterChoices: [],
	subchapterSelections: [],
	results: {},
	error: '',
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
		case VALIDATOR.SET.TOM_DATA: return { ...state, tomData: action.payload };

		case VALIDATOR.PROGRESS.SET: return { ...state, progress: action.payload };
		case VALIDATOR.PROGRESS.UPDATE: return { ...state, progress: action.payload };
		case VALIDATOR.PROGRESS.RESET: return { ...state, progress: 0 };
		case VALIDATOR.PROGRESS.SET_STATUS: return { ...state, progressStatus: action.payload };

		case VALIDATOR.VALIDATE_TOM.START: return { ...state, progress: 0, results: {} };
		case VALIDATOR.VALIDATE_TOM.SUCCESS: return { ...state, progress: 100 };
		case VALIDATOR.VALIDATE_TOM.ERROR: return { ...state, results: [], error: action.payload };

		case VALIDATOR.SUBCHAPTERS.CHOICES.SET: return { ...state, subchapterChoices: action.payload };
		case VALIDATOR.SUBCHAPTERS.SELECTION.CLEAR: return { ...state, subchapterSelections: [] };
		case VALIDATOR.SUBCHAPTERS.SELECTION.SET:
			return {
				...state,
				subchapterSelections: [ ...state.subchapterSelections, state.tomData.files[action.payload] ]
			};

		default: return state;
	}
}

export default validator;