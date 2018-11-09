import { all, call, fork, put, select, take } from 'redux-saga/effects';
import {
	VALIDATOR,
	validateTOMError,
	validateTOMSuccess,
	setResults,
} from 'actions/validator';
import validate from './validate';
import getTOMData from 'lib/validator/get-tom-data';
import watchGetTOMs from './get-toms';
import { withAbort } from '../util';

function* watchStartValidate() {
	while (true) {
		yield take(VALIDATOR.VALIDATE_TOM.START);
		const selectedTOM = yield select(({ validator: { selectedTOM } }) => (selectedTOM));

		try {
			const tomData = yield call(getTOMData, selectedTOM);
			const results = yield call(validate, tomData);
			yield put(setResults(results));
			yield put(validateTOMSuccess());
		} catch (e) {
			console.error('Error validating ' + selectedTOM);
			throw e;
		}
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
	]);
}

export default watchValidator;