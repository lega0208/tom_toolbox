import { cancel, delay, fork, put, take } from 'redux-saga/effects';
import { updateProgress as updateProgressAction } from 'actions/validator';
import { VALIDATOR } from 'actions/validator';

export default function* startTrackProgress(getProgress) {
	const updateTask = yield fork(updateProgress, getProgress);

	yield take(VALIDATOR.VALIDATE_TOM.SUCCESS);
	yield cancel(updateTask);
}

export function* updateProgress(getProgress) {
	// every 600 ms, dispatch a update progress action
	while (true) {
		yield delay(600);
		yield put(updateProgressAction(getProgress()))
	}
}

export class ProgressTracker {
	pagesDone = 0;

	reset() {
		this.pagesDone = 0;
	}
	getPagesDone() {
		return this.pagesDone;
	}
	addPagesDone(num) {
		this.pagesDone += num;
	}
}