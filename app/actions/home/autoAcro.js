import cheerio from 'cheerio';
import getCache from 'database/cache';
import { fireAlert, setTextContent } from './';

import findAcros from 'lib/findAcros';
import cleanup from 'lib/cleanup';
import { clipboard } from 'electron';

export function setAcros(acros) {
	return {
		type: 'SET_ACROS',
		payload: acros,
	}
}
export function mergeAcros(acros) {
	return {
		type: 'MERGE_ACROS',
		payload: acros,
	}
}
export function setDisplay(display) {
	return {
		type: 'SET_DISPLAY',
		payload: display,
	}
}

export function setAcroMap(acroMap) {
	return {
		type: 'SET_ACROMAP',
		payload: acroMap
	};
}
export function setDupsMap(dupsMap) {
	return {
		type: 'SET_DUPSMAP',
		payload: dupsMap
	};
}
export function setNoDefs(noDefs) {
	return {
		type: 'SET_NODEFS',
		payload: noDefs
	}
}
export function mergeAcroMap(acroMap) {
	return {
		type: 'MERGE_ACROMAP',
		payload: acroMap
	};
}

/**
 * Start autoAcro:
 * Get text to convert, find any potential acros.
 * If any are found, set acros array and show modal to prompt for choices
 * @param textContent
 * @returns {function(*)} thunk
 */
export function startAutoAcro(textContent) { // use param w/ convertList, else use clipboard
	return async dispatch => {
		const $ = cheerio.load(textContent, { decodeEntities: false });

		const text = textContent ? textContent : clipboard.readHTML('text/html') || clipboard.readText();
		const acros = (findAcros(text)) || [];

		if (acros.length > 0) {
			await dispatch(setAcros(acros));
			await dispatch(showModal());
		} else {
			await dispatch(endAutoAcro(text));
		}
	}
}

/**
 * Once acro selections are made, this thunk is fired.
 * Takes list of acros, and if it's not empty:
 * 	Finds all definitions for each acro in the cache
 * 	Sorts them into categories based on amount of definitions found:
 * 		"acros" if one def found
 * 		"noDefs" if no defs found
 * 		"dups" if more than one def found
 * 	Sets maps in store for use in other components
 *  Dispatches thunks to show the next screen or finalize "conversion" depending on if any "noDefs" or "dups" are found.
 * If acro list is empty, ends "conversion".
 *
 * @param acros
 * @returns {*} thunk
 */
export function submitAcros(acros = []) {
	if (acros.length > 0) {
		return async (dispatch, getState) => {
			const { lang } = getState().home.options;
			const textContent = clipboard.readText();
			const cache = await getCache();

			// seperate acros with dups, those with just 1 def, and those with none
			const results = await acros.reduce(async (accumulatorP, acro) => {
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

			// map acros to defs & add to payload
			const defs = await cache.getDefs(results.acros, lang);
			const payload = {};

			payload.acroMap = defs.reduce((acroMap, def) => {
				const acro = def['Acronym'];
				acroMap[acro] = def['Definition'];
				return acroMap;
			}, {});

			// add noDefs to payload if there are any
			if (results.noDefs.length > 0) {
				payload.noDefs = [...results.noDefs];
			}

			// map dups to defs & add to payload
			if (results.dups.length > 0) {
				const dupDefs = await cache.getDefs(results.dups, lang);

				payload.dupsMap = dupDefs.reduce((dupsMap, def) => {
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

			// Finish up (Dispatch actions based on if there are acros with more or less than 1 definition

			// If no dups & no acros with 0 defs, do findAndReplace and end autoAcro
			if (!payload.hasOwnProperty('dupsMap') && !payload.hasOwnProperty('noDefs')) {
				const replacedText = findAndReplace(textContent, payload.acroMap);
				return dispatch(endAutoAcro(replacedText));
			}
			// Set def maps
			dispatch(setAcroMap(payload.acroMap));
			if (payload.hasOwnProperty('dupsMap')) {
				dispatch(setDupsMap(payload.dupsMap));
			}

			// Dispatch appropriate action(s)
			if (payload.hasOwnProperty('noDefs')) {
				dispatch(setNoDefs(payload.noDefs));
				dispatch(setDisplay('promptDefs'));
			} else if (payload.hasOwnProperty('dupsMap')) {
				dispatch(makeSubmitAcros(payload.acroMap, payload.dupsMap));
			}
		}
	} else { // empty array / not an array
		return (dispatch) => dispatch(endAutoAcro(clipboard.readText()));
	}
}

/**
 * If no definition is found for some acros, user is prompted to input definition(s).
 * This thunk is dispatched on submission.
 * Takes map of acros:defs and merges it with current acroMap.
 * Then if dupsMap is not empty, dispatches actions to show that screen
 * Else ends "conversion"
 *
 * @param noDefsMap
 * @returns {function(*, *)} thunk
 */
export function submitNoDefs(noDefsMap) {
	return (dispatch, getState) => {
		const globalState = getState();
		const { acroMap, dupsMap } = globalState.autoAcro;
		const textContent = clipboard.readText();
		const mergedMap = {...acroMap, ...noDefsMap};
		if (Object.keys(dupsMap).length > 0) {
			dispatch(setAcroMap(mergedMap));
			dispatch(makeSubmitAcros(mergedMap, dupsMap));
		} else {
			const replacedText = findAndReplace(textContent, mergedMap);
			return dispatch(endAutoAcro(replacedText));
		}
	};
}

// Submit dups
function makeSubmitAcros(acroMap, dupsMap) {
	return {
		type: 'SUBMIT_ACROS',
		payload: {
			acroMap,
			dupsMap
		}
	}
}

export function submitDups() {
	return (dispatch, getState) => {
		const { acroMap } = getState().autoAcro;
		const textContent = clipboard.readText();
		const replacedText = findAndReplace(textContent, acroMap);

		return dispatch(endAutoAcro(replacedText));
	}
}

function endAutoAcro(text) {
	return async (dispatch, getState) => {
		const opts = getState().home.options;
		text = cleanup(text, opts);
		clipboard.writeText(text);
		try {
			await dispatch(setTextContent(text));
			await dispatch({type: 'SUCCESS_MODAL'});
			$('#acronyms').modal('hide');
			await dispatch(fireAlert());
		} catch (e) {
			await dispatch(hideModal());
			await dispatch(fireAlert('danger', e.message));
		}
	}
}

export function showModal() {
	return dispatch => {
		$('#acronyms').modal('show');
		return dispatch({type: 'SHOW_MODAL'});
	}
}

// todo: make sure this is done properly
export function hideModal() {
	return (dispatch, getState) => {
		const cboard = getState().home.state.clipboard;
		const { shouldCancel } = getState().autoAcro;

		if (shouldCancel) {
			clipboard.writeText(cboard);
		}

		$('#home').focus();
		dispatch({type: 'HIDE_MODAL'});
	}
}

function findAndReplace(text, acroMap) {
	const reduceFunc = (replacedText, [acro, def]) => {
		const regex = new RegExp(`([\\s>\\W])${acro}(?!<\/abbr>|[A-Z])`, 'g');
		const firstLastRegex = new RegExp(`^${acro}|${acro}$`, 'gm');
		const parenRegex = new RegExp(`\\(${def}\\)`, 'g');
		
		if (!regex.test(text)) {
			replacedText = replacedText.replace(firstLastRegex, def);
		} else {
			replacedText = replacedText.replace(regex, `$1${def}`);
		}
		if (parenRegex.test(replacedText)) {
			replacedText = replacedText.replace(parenRegex, `(${acro})`);
		}
		return replacedText;
	};

	return Object.entries(acroMap).reduce(reduceFunc, text);
}