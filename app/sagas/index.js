import { all, fork } from 'redux-saga/effects';
import watchHome from './Home';

export default function* rootSaga() {
	yield all([
		fork(watchHome),
	]);
}