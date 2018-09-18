// @flow
import * as alerts from './alert';

export type actionType = {
	type: string,
	payload?: ?any,
};

export const { fireAlert } = alerts;

export * from './options'; // todo: could refactor to "setOption"

export function setTextContent(payload) {
	return {
		type: 'SET_TEXTCONTENT',
		payload
	}
}

export const undo = () => ({ type: 'UNDO' });
export const setClipboard = (payload) => ({ type: 'SET_CLIPBOARD', payload });