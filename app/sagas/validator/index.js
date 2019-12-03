import { all, call, fork, put, select, take } from 'redux-saga/effects';
import {
	VALIDATOR,
	validateTOMError,
	validateTOMSuccess,
	setTOMData,
	startVerifyCache,
	verifyCacheSuccess,
	verifyCacheError,
} from 'actions/validator';
import validate from './validate';
import getTOMData from 'lib/validator/get-tom-data';
import watchGetTOMs from './get-toms';
import { withAbort } from '../util';


export function* getTOMDataSaga(selectedTOM) {
	yield put(startVerifyCache());
	const tomData = yield call(getTOMData, selectedTOM);
	yield put(setTOMData(tomData));
	yield put(verifyCacheSuccess());

	return yield tomData;
}

function* watchStartValidate() {
	while (true) {
		yield take(VALIDATOR.VALIDATE_TOM.START);
		const selectedTOM = yield select(({ validator: { selectedTOM } }) => (selectedTOM));
		const tomData = yield call(getTOMDataSaga, selectedTOM);

		try {
			yield call(validate, tomData);
			yield put(validateTOMSuccess());
		} catch (e) {
			console.error('Error validating ' + tomData.tomName);
			throw e;
		}
	}
}

function* watchSelectTOM() {
	while (true) {
		// verify & update cache and store in state
		const selectedTOM = (yield take(VALIDATOR.SELECT.TOM)).payload;
		yield call(getTOMDataSaga, selectedTOM);

		// get & set subchapters
		//const homepagePath = tomData.homePage + '-e.html';
		//const homepageChildren = tomData.files[homepagePath].children
		//	.map(({ href, text }) => ({
		//		path: href,
		//		title: text
		//	}));
		//yield put(setSubchapterChoices(homepageChildren));
	}
}


function* watchValidator() {
	const watchValidateWithAbort = withAbort(watchStartValidate, function*(e) {
		yield put(validateTOMError(e));
		// trigger alert?
		console.error(e);
	});

	yield all([
		fork(watchValidateWithAbort),
		fork(watchGetTOMs),
		fork(watchSelectTOM),
	]);
}

export default watchValidator;
