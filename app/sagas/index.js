import { all, fork } from 'redux-saga/effects';
import watchHome from './home';
import watchValidator from './validator';
import cache from './cache';
//import watchTOMViewer from './tom-viewer';

export default function* rootSaga() {
	yield all([
		fork(watchHome),
		//fork(watchTOMViewer),
		fork(watchValidator),
		fork(cache),
	]);
}
