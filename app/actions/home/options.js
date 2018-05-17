
export const setLang = (payload) => ({type: 'CHANGE_LANG', payload});
export const setWET = (payload) => ({type: 'CHANGE_WETVERSION', payload});
export const setAutoAcro = (payload) => ({type: 'CHANGE_AUTOACRO', payload});
export const setSpecChars = (payload) => ({type: 'CHANGE_SPECCHARS', payload});
export const setSupNbsp = (payload) => ({type: 'CHANGE_SUPNBSP', payload});


export function toggleLang() {
	return (dispatch, getState) => {
		const { lang } = getState().home.options;

		if (lang === 'en') {
			dispatch(setLang('fr'));
		} else {
			dispatch(setLang('en'));
		}
	}
}

export function toggleWET() {
	return (dispatch, getState) => {
		const { wetVersion } = getState().home.options;

		if (wetVersion === 2) {
			dispatch(setWET(4));
		} else {
			dispatch(setWET(2));
		}
	}
}

export function toggleAutoAcro() {
	return (dispatch, getState) => {
		const { autoAcro } = getState().home.options;

		dispatch(setAutoAcro(!autoAcro));
	}
}

export function toggleSpecChars() {
	return (dispatch, getState) => {
		const { specChars } = getState().home.options;

		dispatch(setSpecChars(!specChars));
	}
}

export function toggleSupNbsp() {
	return (dispatch, getState) => {
		const { supNbsp } = getState().home.options;

		dispatch(setSupNbsp(!supNbsp));
	}
}