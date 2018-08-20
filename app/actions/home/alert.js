// @flow
export function showAlert(payload) {
	return {
		type: 'SHOW_ALERT',
		payload
	}
}

export function hideAlert() {
	return {
		type: 'HIDE_ALERT',
	}
}

export function fireAlert(type = 'success', message) {
	const payload = { type };
	if (message) payload.message = message;

  return (dispatch) => {
		dispatch(showAlert(payload));
		setTimeout(() => dispatch(hideAlert()), 3000);
  };
}

export function setWarning(payload: { message: string, error: ?string }): { type: string, payload: Object } {
	return {
		type: 'SHOW_WARNING',
		payload
	}
}

export function hideWarning() {
	return {
		type: 'HIDE_WARNING'
	}
}