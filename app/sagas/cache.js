import { call, fork, join, take, put, select } from 'redux-saga/effects';
import { CACHE, setWarning, hideWarning } from 'actions/home';
import cacheCheck from 'database/cacheCheck';
import getPathsCache from 'database/paths-cache';

export default function* cache() {
	console.error(console);
	while (true) {
		const { z } = yield take(CACHE.CHECK);

		z('hi');

		console.log('Starting to check [Acronyms] cache');
		window.console.log('Trying this');
		try {
			yield call(cacheCheck);
			const isWarningShown = yield select(({ home: { warning: { show } } }) => (show));

			if (isWarningShown) {
				yield put(hideWarning());
			}
			console.log('Done checking [Acronyms] cache');
			console.error('maybe?');

			console.log('Starting to check [LandingPages] cache');
			const pathsCache = yield call(getPathsCache);
			yield call([pathsCache, pathsCache.validateCache]);

			console.log('Done checking [LandingPages] cache');
			yield call(z, 'hello?');
			yield put({ type: 'DONE_CHECKING', payload: { z, pathsCache, someVal: 1 }});
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
