import { call, put, select, take } from 'redux-saga/effects';
import { replaceSpecChars, replaceSupNbsp } from 'lib/cleanup';
import runAutoAcro from './auto-acro';
import images from './images';

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

			const text = yield select(({ home: { scripts: { text } } }) => text);

			yield put({ type: 'SCRIPTS_END', payload: text });
		} catch ({ stack, message }) {
			console.error('Error in scripts saga:');
			console.error(stack);
			yield put({ type: 'TRIGGER_ALERT', payload: { type: 'danger', message } });
			yield put({ type: 'SCRIPTS_END', payload });
		}
	}
}