// @flow
import { call, cancel, fork, put } from 'redux-saga/effects';
import { pathExists, readFile, readJSONSync, stat } from 'fs-extra';
import validateTOM from 'lib/validator';
import {
	setProgressStatus,
	setProgress,
	setFilecount,
} from 'actions/validator';
import startTrackProgress from './progress';
import Validator from 'lib/validator/Validator';
import { TOMData } from 'lib/validator/get-tom-data';

export default function* validate(tomData: TOMData) {
	yield put(setProgressStatus('Validation in progress'));

	const subchapterSelections = (yield select(({ validator: { subchapterSelections } }) => (subchapterSelections)));
	const rootFile = subchapterSelections[subchapterSelections.length - 1];

	const filesToValidate = yield call(getFilesToValidate, rootFile, tomData);

	const validationData = { ...tomData, selectedFiles: filesToValidate, };

	const validator = new Validator(validationData); // class might not be necessary?

	// set up fileCount for progress tracking
	const fileCount = Object.keys(filesToValidate).length;
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

async function getFilesToValidate(rootNode, tomData) {
	if (rootNode.isHomepage) {
		return tomData.files;
	}

	const files = { [rootNode.path]: rootNode };

	const children = // make sure children isn't null
		typeof rootNode.children === 'object'
			? Object.values(rootNode.children)
			: null;

	if (children && children.length > 0) {
		const childFiles = await Promise.all(Object.values(children).map((child) => getFilesToValidate(child)));
		let childrenObj = {};

		for (const child of childFiles) {
			childrenObj = { ...childrenObj, ...child };
		}
		return { ...files, ...childrenObj };
	}

	console.log('filesToValidate:');
	console.log(files);

	return files;
}