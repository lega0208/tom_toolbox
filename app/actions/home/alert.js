// @flow
export const showAlert = (payload) => ({ type: 'SHOW_ALERT', payload });
export const hideAlert = () => ({ type: 'HIDE_ALERT' });

export const triggerAlert = (type = 'success', message = 'Success!') => ({
	type: 'TRIGGER_ALERT',
	payload: { type, message },
});

export const errorAlert = (message) => ({
	type: 'TRIGGER_ALERT',
	payload: { type: 'danger', message },
});

export const setWarning = (payload: { message: string, error: ?string }) => ({
	type: 'SHOW_WARNING',
	payload
});

export const hideWarning = () => ({ type: 'HIDE_WARNING' });