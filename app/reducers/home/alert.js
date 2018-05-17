
const initialState = {
	type: 'success',
	error: '',
	show: false,
};

export default function alert(state = initialState, action) {
	switch (action.type) {
		case 'SHOW_ALERT': return { ...state, ...action.payload,  show: true };
		case 'HIDE_ALERT': return { ...state, show: false };
		default: return state;
	}
}