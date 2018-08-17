
const initialState = {
	acros: [],
	acroMap: {},
	dups: [],
	dupsMap: {},
	noDefs: [],
	display: 'acroList',
	show: false,
	shouldCancel: true,
};

export default function autoAcro(state = initialState, action) {
	switch(action.type) {
		case 'SET_ACROS': return mergeState('acros');
		case 'MERGE_ACROS': return mergeState('acros', [...state.acros, ...action.payload]);
		case 'ADD_ACRO': return mergeState('acros', [...state.acros, action.payload]);
		case 'REMOVE_ACRO': return mergeState('acros', [...state.acros.splice(action.payload, 1)]);
		case 'SET_ACROMAP': return mergeState('acroMap');
		case 'MERGE_ACROMAP': return mergeState('acroMap', {...state.acroMap, ...action.payload});
		case 'SET_DUPS': return mergeState('dups');
		case 'ADD_DUP': return mergeState('dups', [...state.dups, action.payload]);
		case 'SET_DUPSMAP': return mergeState('dupsMap');
		case 'SET_DISPLAY': return mergeState('display');
		case 'SHOW_MODAL': return mergeState('show', true);
		case 'HIDE_MODAL': return initialState;
		case 'SUCESS_MODAL': return mergeState('shouldCancel', false);
		case 'SET_NODEFS': return mergeState('noDefs');
		case 'SUBMIT_ACROS': return {
			...state,
			acros: [],
			acroMap: action.payload.acroMap,
			dups: [],
			dupsMap: action.payload.dupsMap,
			display: 'chooseAcros',
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