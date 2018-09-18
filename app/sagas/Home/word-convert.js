// @flow
import { clipboard as eClipboard } from 'electron';
import { all, call, fork, join, take, put, select } from 'redux-saga/effects';
import WordConverter from 'lib/word-converter';
import { beautify } from 'lib/util';
import { setTextContent } from 'actions/home';
import { setClipboard } from './util';

// WC = wordConvert
const createWCAction = (type, payload) => ({
	type: `WORDCONVERT_${type.toUpperCase()}`,
	payload
});

const endAction = createWCAction('end');
const finalizeAction = createWCAction('finalize');
const errorAction = (payload) => createWCAction('error', payload);

export default function* wordConvert() {
	yield all([
		fork(watchError),
		fork(watchWordConvert),
	]);
}

function* watchWordConvert() {
	try {
		while (true) {
			yield take('WORDCONVERT_INIT');
			yield fork(initWordConvert);
		}
	} catch (e) {
		yield put(errorAction({ error: e.message }))
	}
}

function* initWordConvert() {
	try {
		yield* preWordConvert();
		yield* startWordConvert();
	} catch(e) {
		console.error(e);
		yield put({ type: 'WORDCONVERT_ERROR', payload: { error: e.message } });
		// fire error modal
		// any other transaction reversal?
	}
}

function* preWordConvert() {
	//yield put(preAction);
	const clipboard = eClipboard.readHTML('text/html') || eClipboard.readText();
	yield setClipboard(clipboard);
}

function* startWordConvert() {
	const { clipboard, options } = yield select(({ home: { clipboard, options } }) => ({ clipboard, options }));
	const opts = options.converter;

	//yield put(startAction);
	const result = yield call(WordConverter, clipboard, opts);

	yield* postWordConvert(result);
}

function* postWordConvert(html) {
	//yield put(postAction);
	yield put({ type: 'SCRIPTS_START', payload: html });

	const scriptResult = (yield take('SCRIPTS_END')).payload;

	yield* finalizeWordConvert(scriptResult);

	yield put(endAction);
}

function* finalizeWordConvert(result) {
	yield put(finalizeAction);
	const beautifiedHtml = beautify(result);

	yield put(setTextContent(beautifiedHtml));
	eClipboard.writeText(beautifiedHtml);
	yield put({ type: 'TRIGGER_ALERT', payload: { type: 'success' } });
}

function* watchError() {
	while (true) {
		const { error } = (yield take('WORDCONVERT_ERROR')).payload;
		yield put({ type: 'TRIGGER_ALERT', payload: { type: 'danger', message: error } });

		const clipboard = yield select(({ home: { clipboard } }) => clipboard);
		// cancel logic goes here
		// copy stashed clipboard, clear clipboard, hide modals, anything else?
		eClipboard.writeText(clipboard);
		yield put(setTextContent(clipboard));
	}
}
// todo: add cancel?