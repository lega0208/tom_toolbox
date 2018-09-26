/*
 * IMAGES type constants
 */
export const IMAGES = {
	CANCEL: 'IMAGES.CANCEL',
	CLEAR: 'IMAGES.CLEAR',
	END: 'IMAGES.END',
	ERROR: 'IMAGES.ERROR',
	SAVE: 'IMAGES.SAVE',
	START: 'IMAGES.START',
	SET: 'IMAGES.SET',
	MAP: {
		SET: 'IMAGES.MAP.SET',
	},
	REMOVE: 'IMAGES.REMOVE',
	SUBMIT: 'IMAGES.SUBMIT',
};

/*
 * IMAGES action creators
 */
const createAction =
	(actionType) =>
		(payload) =>
			payload
				? ({ type: `IMAGES.${actionType.toUpperCase()}`, payload })
				: ({ type: `IMAGES.${actionType.toUpperCase()}` });

export const setImages = createAction('set');
export const setSrcMap = createAction('map.set');
export const removeImage = createAction('remove');
export const clearImages = createAction('clear');
export const cancelImages = createAction('cancel');
export const endImages = createAction('end');
export const errorImages = createAction('error');
export const submitImages = createAction('submit');
export const saveImages = createAction('save');
