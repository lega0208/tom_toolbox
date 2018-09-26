import { put, select, takeEvery } from 'redux-saga/effects';

export default function* watchOptions() {
	const {
		lang,
		wetVersion,
		autoAcro,
		specChars,
		supNbsp,
  } = yield select(({ home: { options: { listType } } }) => ({ listType }));

	yield takeEvery('TOGGLE_LANG');
}

// Figure out a way for this to make sense. Can't "toggle" per se, because you might click on one that's already active.
// Will probably have to set it so that they're set explicitly, straight from the action payload.
function* toggleLang() {
	const { lang } = yield select(({ home: { options: { listType } } }) => ({ listType }));
	const newLang = lang === 'en' ? 'fr' : 'en';

	yield put({ type: 'CHANGE_LANG', payload: newLang });
}
function* toggleWetVersion() {
	const { wetVersion } = yield select(({ home: { options: { wetVersion } } }) => ({ wetVersion }));
	const newWetVersion = wetVersion === 2 ? 4 : 2;

	yield put({ type: 'CHANGE_WETVERSION', payload: newWetVersion });
}
function* toggleAutoAcro() {
	const { autoAcro } = yield select(({ home: { options: { autoAcro } } }) => ({ autoAcro }));

	yield put({ type: 'CHANGE_LANG', payload: !autoAcro });
}