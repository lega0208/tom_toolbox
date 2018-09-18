import { all, fork } from 'redux-saga/effects';
import watchWordConvert from './word-convert';
import watchModal from './modal';
import watchAlert from './alert';
import watchScripts from './scripts';

// todo: add watchers for alert & scripts(run just the selected scripts on clipboard content) (& anything else?)
export default function* watchHome() {
	yield all([
		fork(watchWordConvert),
		fork(watchModal),
		fork(watchAlert),
		fork(watchScripts),
	]);
}