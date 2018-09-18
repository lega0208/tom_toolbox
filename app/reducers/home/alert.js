
const initialState = {
	type: 'success',
	message: '',
	show: false,
};

export function alert(state = initialState, action) {
	switch (action.type) {
		case 'SHOW_ALERT': return { ...state, ...action.payload, show: true };
		case 'HIDE_ALERT': return { ...state, show: false };
		default: return state;
	}
}

const warnInitialState = {
	message: '',
	error: '',
	show: false,
};

export function warning(state = warnInitialState, action) {
	switch (action.type) {
		case 'SHOW_WARNING': return {
			...state,
			...action.payload,
			show: true
		};
		case 'HIDE_WARNING': return {
			...state,
			show: false,
		};
		case 'SET_WARNING': return {
			...state,
			...action.payload,
		};
		default: return state;
	}
}