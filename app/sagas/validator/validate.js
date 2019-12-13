// @flow
import { eventChannel, END } from 'redux-saga';
import { call, cancel, cancelled, fork, put, select, take } from 'redux-saga/effects';
import {
	setFilecount,
	setProgressStatus,
	setProgress,
	setResults,
	updateProgress,
} from 'actions/validator';
//import startTrackProgress, { ProgressTracker } from './progress';

//import Worker from 'lib/validator/Worker.js';
import validateWithPool from 'lib/validator/worker-pool';

//function validateWithWorker(files, tomData, emitter) {
//	console.log('validateWithWorker:');
//	console.log(`size: ${files.length}`);
//	const worker = new Worker();
//
//	return new Promise((res, rej) => {
//		try {
//			worker.onmessage = (msg) => {
//				if (typeof msg.data === 'number') {
//					emitter({ progress: msg.data });
//				} else {
//					res(msg.data);
//				}
//			};
//			worker.postMessage([files, tomData]);
//		} catch (e) {
//			console.error(e);
//			rej(e);
//		}
//	});
//}

//async function batchWorkers(files, tomData, emitter) {
//	console.log('batchWorkers');
//	const total = files.length;
//	const tasks = [];
//	const numWorkers = total > 100 ? process.env.NUMBER_OF_PROCESSORS - 1 : 1;
//	const chunkSize = Math.ceil(files / numWorkers);
//	console.log(`numWorkers: ${numWorkers}`);
//	console.log(`chunkSize: ${chunkSize}`);
//	// this is all messed up
//
//	for (let i = 0; i < numWorkers; i++) {
//		tasks.push(validateWithWorker(files.splice(0, chunkSize), tomData, emitter));
//		console.log(`${files.length} files left of ${total}`);
//	}
//
//	return (await Promise.all(tasks)).reduce((acc, results) => acc.concat(results), []);
//}

function workerChannel(files, tomData) {
	return eventChannel(emitter => {
		try {
			validateWithPool(files, tomData, emitter);
		} catch (e) {
			console.error(e);
			emitter({ error: e });
		}

		return () => console.log('workerChannel donezo?');
	});
}

function* validateWithWorkerSaga(files, tomData) {
	const chan = yield call(workerChannel, files, tomData);

	try {
		while (true) {
			const message = yield take(chan);
			if (message.results) {
				yield put(setResults(message.results));
				return;
			}
			if (message.progress) {
				yield put(updateProgress(message.progress));
			}
			if (message.error) {
				throw message.error;
			}
		}
	} finally {
		console.log('validation donezo');
		chan.close();
	}
}

export default function* validate(tomData) {
	yield put(setProgressStatus('Validation in progress'));

	//const subchapterSelections = (yield select(({ validator: { subchapterSelections } }) => (subchapterSelections)));
	//const rootFile = subchapterSelections[subchapterSelections.length - 1];

	const filesToValidate = Object.values(tomData.files);

	yield put(setFilecount(filesToValidate.length));

	// start validation
	console.log('about to start validation:');
	yield call(validateWithWorkerSaga, filesToValidate, tomData);

	// validation complete
	yield put(setProgress(100));
	yield put(setProgressStatus('Validation complete:'));
}

