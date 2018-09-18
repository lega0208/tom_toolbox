import { call, fork, join, put, select, take } from 'redux-saga/effects';
import { findAndReplace, wrapWithAbbr } from 'lib/util';
import { withAbort } from '../util';
import getCache from 'database/cache';
import findAcros from 'lib/findAcros';
import {
	startAutoAcro as startAutoAcroAction,
	setAcros,
	setDupsMap,
	setNoDefs,
	autoAcroError,
} from 'actions/home/autoAcro';
import { errorAlert } from 'actions/home/alert';
import { AUTOACRO } from 'actions/home/autoAcro';

function* startAutoAcro(text) {
	try {
		yield put(startAutoAcroAction(text)); // Just for debugging?
		const foundAcros = yield call(findAcros, text);

		if (foundAcros.length < 1) {
			return text;
		} else {
			const cacheTask = yield fork(getCache);
			yield put(setAcros(foundAcros));
			yield put({ type: 'MODAL_TRIGGER_SHOW', payload: { display: 'autoAcro', screen: 'acroList' } });

			// block until acroList is submitted
			yield take(AUTOACRO.SUBMIT.ACROLIST);
			const queryPropsSelector = ({
        home: {
          autoAcro: { acros },
          options : {
            converter: { lang },
          },
        }
      }) => ({ acros, lang });

			const { acros, lang } = yield select(queryPropsSelector);

			const cache = yield join(cacheTask);
			const queryResults = yield call(classifyAcros, cache, acros, lang);
			const acroDefs = yield call([cache, 'getDefs'], queryResults.acros, lang);

			const acroMap = acroDefs.reduce((acroMap, def) => {
				const acro = def['Acronym'];
				acroMap[acro] = def['Definition'];
				return acroMap;
			}, {});

			const { noDefs, dups } = queryResults;
			let chooseDupsResults;
			let noDefResults;

			if (dups.length > 0) {
				const mapDupsTask = yield fork(mapDups, cache, dups, lang); // keeping it async to try and optimize performance
				const dupsMap = yield join(mapDupsTask);
				yield put(setDupsMap(dupsMap));
				yield put({ type: 'MODAL_SET_SCREEN', payload: 'chooseDups' });


				// Block until choosedups is submitted
				// when dispatching this action the payload should include a map of the selections
				yield take(AUTOACRO.SUBMIT.CHOOSEDUPS);
				chooseDupsResults = yield select(({ home: { autoAcro: { dupsSelections } } }) => dupsSelections);
			} else {
				chooseDupsResults = {}; // to be able to use spread syntax
			}

			if (noDefs.length > 0) {
				yield put(setNoDefs(noDefs));
				yield put({ type: 'MODAL_SET_SCREEN', payload: 'addDefs' }); // make a "next screen" action instead?
				yield take(AUTOACRO.SUBMIT.NODEFS);
				const noDefsMap = yield select(({ home: { autoAcro: { noDefsMap } } }) => noDefsMap);
				noDefResults = wrapWithAbbr(noDefsMap);
			} else {
				noDefResults = {}; // to be able to use spread syntax
			}

			const mergedAcroMap = {
				...acroMap,
				...chooseDupsResults,
				...noDefResults,
			};

			return yield call(findAndReplace, text, mergedAcroMap);
		}
	} catch (e) {
		yield put(autoAcroError(e));
		throw e;
	}
}

export default function* autoAcro(text) {
	const onError = function* (e) {
		yield put(errorAlert(e.message));
		console.error(e);
	};
	const startAutoAcroWithAbort = withAbort([startAutoAcro, text], onError, {
		cancelActionType: [AUTOACRO.CANCEL, 'MODAL_HIDE'],
		cleanup: function*() {
				yield put({ type: AUTOACRO.END });
				yield put({ type: 'MODAL_TRIGGER_HIDE' });
		}
	});

	return yield call(startAutoAcroWithAbort);
}

/* Moving these here to reduce code clutter */

/**
 * Takes a list of acronyms and seperates them based on the number of definitions found.
 * @returns {Promise<object>} An object with each key being a different "classification":
 * "acros" have 1 definition
 * "dups" have more than 1
 * "noDefs" have 0
 */
async function classifyAcros(cache, acros, lang) {
	return acros.reduce(async (accumulatorP, acro) => {
		const accumulator = await accumulatorP;
		const count = await cache.getAcroCount(acro, lang);

		if (count > 1) {
			accumulator.dups.push(acro);
			return accumulator;
		} else if (count === 1) {
			accumulator.acros.push(acro);
			return accumulator;
		} else {
			console.log('No acronym found for ' + acro);
			accumulator.noDefs.push(acro);
			return accumulator;
		}
	}, Promise.resolve({ acros: [], dups: [], noDefs: [] }));
}

/**
 * Takes the cache, array of acronyms with multiple definitions, and lang;
 * @returns {Promise<Object>} a map of the acronyms with an array of definitions
 */
async function mapDups(cache, dups, lang) {
	const dupDefs = await cache.getDefs(dups, lang);

	return dupDefs.reduce((dupsMap, def) => {
		const a = def['Acronym'];
		const d = def['Definition'];
		if (!dupsMap.hasOwnProperty(a)) {
			dupsMap[a] = [d];
			return dupsMap;
		}
		dupsMap[a] = [...dupsMap[a], d];
		return dupsMap;
	}, {});
}