import * as alerts from './alert';

export const { fireAlert } = alerts;

export * from './options';

export function setTextContent(payload) {
	return {
		type: 'SET_TEXTCONTENT',
		payload
	}
}

export const undo = () => ({type: 'UNDO'});
