// @flow
import { call, cancel, fork, put } from 'redux-saga/effects';
import { pathExists, readFile, readJSONSync, stat } from 'fs-extra';
import validateTOM, from 'lib/validator';
import {
	setProgressStatus,
	setProgress,
	setFilecount,
} from 'actions/validator';
import startTrackProgress, from './progress';
import Validator from 'lib/validator/Validator';
import { TOMData } from 'lib/validator/get-tom-data';

export default function* validate(tomData: TOMData) {
	yield put(setProgressStatus('Validation in progress'));

	const validator = new Validator(tomData);

	// set up fileCount for progress tracking
	const fileCount = Object.keys(tomData.files).length;
	// multiply fileCount by amount of steps (if more than 1) and increment for each file for every step
	yield put(setFilecount(fileCount));

	// start progress tracking
	const progressTask = yield fork(startTrackProgress, validator.getProgress.bind(validator));

	// start validation
	console.log('about to start validation:');
	const { tomResults, tomErrors } = yield call(validateTOM, validator);

	// validation complete
	yield put(setProgress(100));
	yield put(setProgressStatus('Validation complete:'));

	// stop progress tracking
	yield cancel(progressTask);

	// fire error alert if errors.length > 0
	if (tomErrors.length > 0) {
		console.error('tomErrors:');
		console.error(tomErrors);
		//yield put({ type: 'VALIDATOR_ERROR_ALERT', payload: { stuff:  'stuff' } });
	}

	return yield tomResults;
}

//function* validate(selectedTOM) {
//	// [0] for english only, for now. Will need to throw everything in a loop
//	const homepage = (yield select(({ validator: { toms } }) => (toms)))[selectedTOM][0];
//
//	// object for tracking progress
//	const progress = new ProgressTracker();
//
//	const fileCount = yield call(countDirFiles, homepage);
//	yield put(setFilecount(Math.round(fileCount / 2))); // divide by 2 because ignoring french files while developing
//
//	// start progress tracking
//	const progressTask = yield fork(startTrackProgress, homepage, progress);
//
//	// start validation
//	const tomResults = yield call(validateTOM, homepage, selectedTOM, progress);
//
//	yield put(setProgress(100));
//
//	yield put(setProgressStatus('Validation complete:'));
//	// stop progress tracking
//	yield cancel(progressTask);
//
//	return yield tomResults;
//}