import { call, fork, join, take, put, select } from 'redux-saga/effects';
import { CACHE, setWarning, hideWarning } from 'actions/home';
import validateCache from 'database/validate-cache';

export default function* cache() {
	while (true) {
		yield take(CACHE.CHECK);
		yield put({ type: `${CACHE.CHECK}.START` });

		try {
			const cacheCheckTask = yield fork(validateCache);
			const isWarningShown = yield select(({ home: { warning: { show } } }) => (show));
			yield join(cacheCheckTask);

			if (isWarningShown) {
				yield put(hideWarning());
			}

			yield put({ type: `${CACHE.CHECK}.END` });
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
