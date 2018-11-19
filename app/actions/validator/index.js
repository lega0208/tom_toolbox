
export const VALIDATOR = {
	VALIDATE_TOM: {
		START: 'VALIDATOR.VALIDATE_TOM.START',
		ERROR: 'VALIDATOR.VALIDATE_TOM.ERROR',
		SUCCESS: 'VALIDATOR.VALIDATE_TOM.SUCCESS',
	},
	FILTERS: {
		SET: 'VALIDATOR.FILTERS.SET', // for validation filters (i.e. title)
	},
	GET_TOMS: {
		START: 'VALIDATOR.GET_TOMS.START',
		ERROR: 'VALIDATOR.GET_TOMS.ERROR',
		SUCCESS: 'VALIDATOR.GET_TOMS.SUCCESS',
	},
	SELECT: {
		TOM: 'VALIDATOR.SELECT.TOM',
	},
	SET: {
		RESULTS: 'VALIDATOR.SET.RESULTS',
		FILECOUNT: 'VALIDATOR.SET.FILECOUNT',
		TOM_DATA: 'VALIDATOR.SET.TOM_DATA',
	},
	SUBCHAPTERS: {
		GET: 'VALIDATOR.SUBCHAPTERS.GET',
		SELECTION: {
			CLEAR: 'VALIDATOR.SUBCHAPTERS.SELECTION.CLEAR',
			SET: 'VALIDATOR.SUBCHAPTERS.SELECTION.SET',
		},
		CHOICES: {
			SET: 'VALIDATOR.SUBCHAPTERS.CHOICES.SET',
		},
	},
	PROGRESS: {
		UPDATE: 'VALIDATOR.PROGRESS.UPDATE',
		SET: 'VALIDATOR.PROGRESS.SET',
		RESET: 'VALIDATOR.PROGRESS.RESET',
		SET_STATUS: 'VALIDATOR.PROGRESS.SET_STATUS',
	},
};

export const selectTOM = (tomName) => ({ type: VALIDATOR.SELECT.TOM, payload: tomName });

export const setFilters = () => ({ type: VALIDATOR.FILTERS.SET });

export const validateTOMStart = () => ({ type: VALIDATOR.VALIDATE_TOM.START });
export const validateTOMError = (e) => ({ type: VALIDATOR.VALIDATE_TOM.ERROR, payload: e });
export const validateTOMSuccess = () => ({ type: VALIDATOR.VALIDATE_TOM.SUCCESS });

export const getTOMsStart = () => ({ type: VALIDATOR.GET_TOMS.START });
export const getTOMsError = (e) => ({ type: VALIDATOR.GET_TOMS.ERROR, payload: e });
export const getTOMsSuccess =
	(toms) => ({ type: VALIDATOR.GET_TOMS.SUCCESS, payload: toms }); // map of tom names to homepage paths

export const setTOMData = (tomData) => ({ type: VALIDATOR.SET.TOM_DATA, payload: tomData });

export const getSubchapters = () => ({ type: VALIDATOR.SUBCHAPTERS.GET });
export const selectSubchapter = (path) => ({ type: VALIDATOR.SUBCHAPTERS.SELECTION.SET, payload: path });
export const clearSubchapters = () => ({ type: VALIDATOR.SUBCHAPTERS.SELECTION.CLEAR });
export const setSubchapterChoices =
	(subchapters) => ({ type: VALIDATOR.SUBCHAPTERS.CHOICES.SET, payload: subchapters });

export const setResults = (results) => ({ type: VALIDATOR.SET.RESULTS, payload: results });

export const setFilecount = (fileCount) => ({ type: VALIDATOR.SET.FILECOUNT, payload: fileCount });
export const setProgress = (progress) => ({ type: VALIDATOR.PROGRESS.SET, payload: progress });
export const setProgressStatus = (status) => ({ type: VALIDATOR.PROGRESS.SET_STATUS, payload: status });
export const resetProgress = () => ({ type: VALIDATOR.PROGRESS.RESET });
export const updateProgress = (numFiles) => ({ type: VALIDATOR.PROGRESS.UPDATE, payload: numFiles });
