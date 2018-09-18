import { put } from 'redux-saga/effects';
import { setClipboard as setCb } from 'actions/home';

export function* setClipboard(value) {
	yield put(setCb(value));
}// todo: implement