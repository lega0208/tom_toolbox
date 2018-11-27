// @flow
import { call, cancel, fork, put, select } from 'redux-saga/effects';
import { pathExists, readFile, readJSONSync, stat } from 'fs-extra';
import validateTOM from 'lib/validator';
import {
	setProgressStatus,
	setProgress,
	setFilecount,
} from 'actions/validator';
import startTrackProgress, { ProgressTracker } from './progress';

export default function* validate(tomData) {
	yield put(setProgressStatus('Validation in progress'));

	//const subchapterSelections = (yield select(({ validator: { subchapterSelections } }) => (subchapterSelections)));
	//const rootFile = subchapterSelections[subchapterSelections.length - 1];

	const progress = new ProgressTracker();

	const filesToValidate = Object.values(tomData.files);

	//const filesToValidate = yield call(getFilesToValidate, rootFile, tomData);
	yield put(setFilecount(filesToValidate.length));
	progress.setTotal(filesToValidate.length);

	// start progress tracking
	const progressTask = yield fork(startTrackProgress, progress.getProgress.bind(progress));

	// start validation
	console.log('about to start validation:');
	const tomResults = yield call(validateTOM, filesToValidate, tomData, progress);

	// validation complete
	yield put(setProgress(100));
	yield put(setProgressStatus('Validation complete:'));

	// stop progress tracking
	yield cancel(progressTask);

	return yield tomResults;
}

//async function getFilesToValidate(rootNode, tomData) {
//	if (rootNode.isHomepage) {
//		return tomData.files;
//	}
//
//	const files = { [rootNode.path]: rootNode };
//
//	const children = // make sure children isn't null
//		typeof rootNode.children === 'object'
//			? Object.values(rootNode.children)
//			: null;
//
//	if (children && children.length > 0) {
//		const childFiles = await Promise.all(Object.values(children).map((child) => getFilesToValidate(child)));
//		let childrenObj = {};
//
//		for (const child of childFiles) {
//			childrenObj = { ...childrenObj, ...child };
//		}
//		return { ...files, ...childrenObj };
//	}
//
//	console.log('filesToValidate:');
//	console.log(files);
//
//	return files;
//}