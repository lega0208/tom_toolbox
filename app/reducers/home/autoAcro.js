import { AUTOACRO } from 'actions/home';

const initialState = {
	acros: [],
	acroMap: {},
	dups: [],
	dupsMap: {},
	dupsSelections: {},
	noDefs: [],
	noDefsMap: {},
};

export default function autoAcro(state = initialState, action) { // todo: clean up / remove unneeded
	const mergeState = (propName, replaceVal) => ({
		...state,
		[propName]: replaceVal || action.payload,
	});

	switch(action.type) {
		case AUTOACRO.ADD.ACRO: return mergeState('acros', [ ...state.acros, ...action.payload ]);
		case AUTOACRO.ADD.DUPS: return mergeState('dups', [ ...state.dups, action.payload ]);

		case AUTOACRO.CANCEL: return state; // triggers saga
		case AUTOACRO.CLEAR: return initialState;
		case AUTOACRO.ERROR: return state; // should trigger saga

		case AUTOACRO.MERGE.ACROS: return mergeState('acros', [ ...state.acros, ...action.payload ]);
		case AUTOACRO.MERGE.ACROMAP: return mergeState('acroMap', { ...state.acroMap, ...action.payload });

		case AUTOACRO.REMOVE.ACRO: return mergeState('acros', [ ...state.acros.splice(action.payload, 1) ]);

		case AUTOACRO.SET.ACROS: return mergeState('acros');
		case AUTOACRO.SET.ACROMAP: return mergeState('acroMap');
		case AUTOACRO.SET.DUPS: return mergeState('dups');
		case AUTOACRO.SET.DUPSMAP: return mergeState('dupsMap');
		case AUTOACRO.SET.DUPS_SELECTIONS: return mergeState('dupsSelections', { ...state.dupsSelections, ...action.payload });
		case AUTOACRO.SET.NODEFS: return {
			...state,
			noDefs: action.payload,
			noDefsMap: action.payload.reduce((acc, noDef) => {
				acc[noDef] = state.noDefsMap[noDef] || '';
				return acc;
			}, {}),
		};
		case AUTOACRO.SET.NODEFSMAP: return mergeState('noDefsMap', { ...state.noDefsMap, ...action.payload });

		case AUTOACRO.START: return initialState;

		case AUTOACRO.SUBMIT.ACROLIST: return state; // triggers saga
		case AUTOACRO.SUBMIT.CHOOSEDUPS: return state; // triggers saga
		case AUTOACRO.SUBMIT.NODEFS: return state; // triggers saga
		default: return state;
	}
}