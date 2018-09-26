import { call, fork, join, take, put, select } from 'redux-saga/effects';
import { CACHE, setWarning, hideWarning } from 'actions/home';
import cacheCheck from 'database/cacheCheck';

export default function* cache() {
	while (true) {
		yield take(CACHE.CHECK);

		console.log('Starting to check cache');
		try {
			const cacheCheckTask = yield fork(cacheCheck);
			const isWarningShown = yield select(({ home: { warning: { show } } }) => (show));
			yield join(cacheCheckTask);

			if (isWarningShown) {
				yield put(hideWarning());
			}
			console.log('Done checking cache');
		} catch (e) {
			yield call(handleCacheError, e);
		}
	}
}

function* handleCacheError(e) {
	const error =
		e.message.includes('cscript.exe error') ? 'Error: Database connection could not be established.' : e.message;
	const message =
		'There was a problem connecting to the database. Please verify that you have the correct path.\n\
			Otherwise, try toggling the DB driver via File -> Toggle DB Driver.';
	yield put(setWarning({ message, error }));
	console.error(e.message);
}