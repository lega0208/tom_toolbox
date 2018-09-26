
export const TOMVIEWER = {
	LOAD_FILE: {
		ERROR: 'TOMVIEWER.LOAD_FILE.ERROR',
		SUCCESS: 'TOMVIEWER.LOAD_FILE.SUCCESS',
		START: 'TOMVIEWER.LOAD_FILE.START',
	},
	SELECT: {
		FILE: 'TOMVIEWER.SELECT.FILE',
	},
	SET: {
		DATA: 'TOMVIEWER.SET.DATA',
	},
};

const makeAction =
	(type, suffix) =>
		(payload) =>
			payload ? ({ type: TOMVIEWER[type][suffix], payload })
							: ({ type: TOMVIEWER[type][suffix]});

export const loadTomFile = makeAction('LOAD_FILE', 'START');
export const loadTomError = makeAction('LOAD_FILE', 'ERROR');
export const loadTomSuccess = makeAction('LOAD_FILE', 'SUCCESS');

export const selectTomFile = makeAction('SELECT', 'FILE');
export const setTomData = makeAction('SET', 'DATA');