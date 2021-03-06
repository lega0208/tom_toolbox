import { call, put, take, delay } from 'redux-saga/effects';

export default function* watchAlert() {
	while (true) {
		const { payload } = yield take('TRIGGER_ALERT');
		yield call(triggerAlert, payload);
	}
}

function* triggerAlert({ type, message }) {
	const successMsg = 'Result has been copied to your clipboard.';
	const delayAmount = type === 'success' ? 3000 : 10000;

	// if message is empty or undefined, sets default message based on alert type
	const showAlert = (type, message = (type === 'success' ? successMsg : 'Something went wrong')) => ({
		type: 'SHOW_ALERT',
		payload: {
			type,
			message,
		}
	});
	yield put(showAlert(type, message));
	yield delay(delayAmount);
	yield put({ type: 'HIDE_ALERT' })
}
