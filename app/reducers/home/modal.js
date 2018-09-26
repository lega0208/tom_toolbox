/*
 * Modal reducer
 */

const initModalState = { display: null, screen: null, show: false };
export default function modal(state = initModalState, action) {
	try {
		switch (action.type) {
			case 'MODAL_TRIGGER_SHOW': // This action triggers a side-effect which shows the modal w/ jQuery
				return { ...state, ...action.payload, };
			case 'MODAL_TRIGGER_HIDE':
				return initModalState; // This action triggers a side-effect which hides the modal w/ jQuery
			case 'MODAL_SET':
				return { ...state, ...action.payload };
			case 'MODAL_SET_DISPLAY':
				return { ...state, display: action.payload };
			case 'MODAL_SET_SCREEN':
				return { ...state, screen: action.payload };
			case 'MODAL_SHOW':
				return { ...state, show: true };
			case 'MODAL_HIDE':
				return { ...state, show: false };
			case 'MODAL_CLEAR':
				return initModalState;
			default:
				return state;
		}
	} catch (e) {
		console.error(e);
	}
}