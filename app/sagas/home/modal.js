import { all, call, fork, put, take, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

// This modal channel will pipe jQuery modal events to redux-saga to keep the state in sync
function createModalChannel() {
	return eventChannel((emit) => {
		$(document).on('hidden.bs.modal', '#modal', () => emit({ event: 'hideModal' }));
		$(document).on('show.bs.modal', '#modal', () => emit({ event: 'showModal' }));

		// returns unsubscribe function
		return () => {
			$(document).off('hide.bs.modal', '#modal');
			$(document).off('show.bs.modal', '#modal');
		}
	});
}

function* watchModalChannel() {
	try {
		const modalChannel = yield call(createModalChannel);

		while (true) {
			const show = yield select(({ home: { modal: { show } } }) => show);
			const { event } = yield take(modalChannel);

			if (event.startsWith('show') && !show) {
				yield put({ type: 'MODAL_SHOW' });
			}
			if (event.startsWith('hide') && show) {
				yield put({ type: 'MODAL_HIDE' });
			}
		}
	} catch (e) {
		console.error(e);
	}
}


function* watchTriggerModal() {
	const triggerModal = (showOrHide) => $('#modal').modal(showOrHide);
	const modalTriggers = [
		'MODAL_TRIGGER_SHOW',
		'MODAL_TRIGGER_HIDE'
	];

	while (true) {
		const { type } = yield take(modalTriggers);
		if (type === 'MODAL_TRIGGER_SHOW') {
			yield call(triggerModal, 'show');
		} else if (type === 'MODAL_TRIGGER_HIDE') {
			yield call(triggerModal, 'hide');
		}
	}
}

export default function* watchModal() {
	yield all([
		fork(watchModalChannel),
		fork(watchTriggerModal),
	]);
}
