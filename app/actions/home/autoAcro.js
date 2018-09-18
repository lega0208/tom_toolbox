// @flow

/*
 * AUTOACRO type constants
 */
export const AUTOACRO = {
	ADD: {
		ACRO: 'AUTOACRO.ADD.ACRO',
		DUP: 'AUTOACRO.ADD.DUP',
	},
	CANCEL: 'AUTOACRO.CANCEL',
	CLEAR: 'AUTOACRO.CLEAR',
	END: 'AUTOACRO.END',
	ERROR: 'AUTOACRO.ERROR',
	MERGE: {
		ACROS: 'AUTOACRO.MERGE.ACROS',
		ACROMAP: 'AUTOACRO.MERGE.ACROMAP',
	},
	SET: {
		ACROS: 'AUTOACRO.SET.ACROS',
		ACROMAP: 'AUTOACRO.SET.ACROMAP',
		DUPS: 'AUTOACRO.SET.DUPS',
		DUPSMAP: 'AUTOACRO.SET.DUPSMAP',
		DUPS_SELECTIONS: 'AUTOACRO.SET.DUPS_SELECTIONS',
		NODEFS: 'AUTOACRO.SET.NODEFS',
		NODEFSMAP: 'AUTOACRO.SET.NODEFSMAP',
	},
	START: 'AUTOACRO.START',
	SUBMIT: {
		ACROLIST: 'AUTOACRO.SUBMIT.ACROLIST',
		CHOOSEDUPS: 'AUTOACRO.SUBMIT.CHOOSEDUPS',
		NODEFS: 'AUTOACRO.SUBMIT.NODEFS',
	},
	REMOVE: {
		ACRO: 'AUTOACRO.REMOVE.ACRO',
	},
};

/*
 * AUTOACRO action creators
 */
const withAutoAcroType =
	(actionType) =>
		(actionTarget = '') =>
			(payload) => {
				const type = `AUTOACRO.${actionType}${actionTarget ? `.${actionTarget}` : ''}`;
				return payload ? { type, payload } : { type }
			};

const makeSetAction = withAutoAcroType('SET');
const makeSubmitAction = withAutoAcroType('SUBMIT');
const makeMergeAction = withAutoAcroType('MERGE');
export const cancelAutoAcro = withAutoAcroType('CANCEL')();
export const startAutoAcro = withAutoAcroType('START')();
export const autoAcroError = withAutoAcroType('ERROR')();

export const submitAcroList = makeSubmitAction('ACROLIST');
export const submitAddDefs = makeSubmitAction('NODEFS'); // make names consistent
export const submitChooseDups = makeSubmitAction('CHOOSEDUPS'); // make names consistent

export const setAcros = makeSetAction('ACROS');
export const setAcroMap = makeSetAction('ACROMAP');
export const setNoDefs = makeSetAction('NODEFS');
export const setNoDefsMap = makeSetAction('NODEFSMAP');
export const setDups = makeSetAction('DUPS');
export const setDupsMap = makeSetAction('DUPSMAP');
export const setDupsSelections = makeSetAction('DUPS_SELECTIONS');

export const mergeAcroMap = makeMergeAction('ACROMAP');