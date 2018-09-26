import { call, put, select, take } from 'redux-saga/effects';
import { replaceSpecChars, replaceSupNbsp } from 'lib/cleanup';
import { setTextContent, triggerAlert, errorAlert, startScripts } from 'actions/home';
import runAutoAcro from './auto-acro';
import images from './images';
import { beautify } from 'lib/util';
import { clipboard as eClipboard } from "electron";

export default function* watchScripts() {
	const setText = (text) => ({ type: 'SCRIPTS_SET_TEXT', payload: text });
	const scriptsMap = {
		autoAcro : runAutoAcro,
		specChars: replaceSpecChars,
		supNbsp  : replaceSupNbsp,
		images,
	};

	while (true) {
		const { payload } = yield take('SCRIPTS_START');
		try {
			const scripts = yield select(({ home: { options: { scripts } } }) => scripts); // autoAcro, specChars, supNbsp

			yield put({ type: 'SCRIPTS_SET_TEXT', payload });

			for (const scriptName of Object.keys(scripts)) {
				if (scripts[scriptName]) {
					const text = yield select(({ home: { scripts: { text } } }) => text);
					const result = yield call(scriptsMap[scriptName], text);
					yield put(setText(result || text)); // if result is undefined, return given text
				}
			}

			const { text, status } = yield select(({
				home: {
					scripts: { text },
					wordConvert: { status },
				}
			}) => ({ text, status }));

			if (status === 'started') {
				yield put({ type: 'SCRIPTS_END', payload: text });
			} else {
				const beautifiedHtml = yield call(beautify, text);

				yield put(setTextContent(beautifiedHtml));
				eClipboard.writeText(beautifiedHtml);
				yield put(triggerAlert());
			}

		} catch ({ stack, message }) {
			console.error('Error in scripts saga:');
			console.error(stack);
			yield put(errorAlert(message));
			yield put({ type: 'SCRIPTS_END', payload });
		}
	}
}