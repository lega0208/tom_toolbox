
const initialState = {
	type: 'success',
	error: '',
	show: false,
	warning: {
		message: '',
		error: '',
		show: false,
	}
};

export default function alert(state = initialState, action) {
	switch (action.type) {
		case 'SHOW_ALERT': return { ...state, ...action.payload,  show: true };
		case 'HIDE_ALERT': return { ...state, show: false };
		case 'SHOW_WARNING': return {
			...state,
			warning: {
				...state.warning,
				...action.payload,
				show: true
			}
		};
		case 'HIDE_WARNING': return {
			...state,
			warning: {
				...state.warning,
				show: false
			}
		};
		default: return state;
	}
}