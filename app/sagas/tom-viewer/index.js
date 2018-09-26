import { all, call, fork, put, select, take } from 'redux-saga/effects';
import { TOMVIEWER, loadTomSuccess, loadTomError, setTomData } from 'actions/tom-viewer';
import { withAbort } from '../util';
import { loadFile } from 'lib/tom-viewer';

function* watchLoadFile() {
	while (true) {
		yield take(TOMVIEWER.LOAD_FILE.START);
		const selectedPage = yield select(({ tomViewer: { selectedPage } }) => (selectedPage));

		try {
			const data = yield call(loadFile, selectedPage);
			yield put(setTomData(data));
			yield put(loadTomSuccess())
		} catch (e) {
			console.error('Error loading file');
			throw e;
		}
	}
}

function* watchTOMViewer() {
	const watchLoadFileWithAbort = withAbort(watchLoadFile, function*(e) {
		yield put(loadTomError(e));
		// trigger alert?
		console.error(e);
	});

	yield all([
		fork(watchLoadFileWithAbort),
	]);
}

export default watchTOMViewer;