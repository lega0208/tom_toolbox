import { cancel, delay, fork, put, take,  } from 'redux-saga/effects';
import { updateProgress as updateProgressAction } from 'actions/validator';
import { VALIDATOR } from 'actions/validator';

export default function* startTrackProgress(getProgress) {
	const updateTask = yield fork(updateProgress, getProgress);

	yield take(VALIDATOR.VALIDATE_TOM.SUCCESS);
	yield cancel(updateTask);
}

export function* updateProgress(getProgress) {
	// every 500 ms, dispatch a update progress action
	while (true) {
		yield take();
		yield put(updateProgressAction(getProgress()))
	}
}

export class ProgressTracker {
	constructor() {
		this.numCompleted = 0;
		this.total = 0;
		this.progress = 0;
	}

	setTotal(num = 0) {
		this.total = num;
	}

	addCompleted(num = 1) {
		this.numCompleted += num;
	}
	incrementProgress() {
		this.numCompleted += 1;
	}
	//getProgress() { // get % done
	//	return Math.floor((this.numCompleted / this.total) * 100);
	//}
	setProgress(progress) {
		this.progress = progress;
	}
	done() {
		this.progress = 100;
	}
	reset(newTotal = 0) {
		this.completed = 0;
		this.progress = 0;
		this.total = newTotal;
	}
}
