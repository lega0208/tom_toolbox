
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

export function fireAlert(e) {
	const type = e ? 'danger' : 'success';
	const error = e ? e.message : '';
	const payload = {type, error};

	if (e) console.error(e);

  return (dispatch) => {
		dispatch(showAlert(payload));
		setTimeout(() => dispatch(hideAlert()), 3000);
  };
}