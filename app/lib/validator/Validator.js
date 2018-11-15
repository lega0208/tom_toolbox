// @flow
import { basename } from 'path';
import {
	FileData,
	PageResults,
	ProgressTracking,
	TOMData,
	TOMResults,
	ValidationError,
	ValidationFunction,
	ValidationResult,
	ValidatorInterface
} from 'lib/validator/types';

type AdditionalErrorMessage = { header: string, message: string } | string;

const makeError = (message: string, ...additionalMessages?: Array<AdditionalErrorMessage>): ValidationError => ({
	message,
	...additionalMessages
});

const makeValidateFunc =
	(title: string, func: (fileData: FileData) => Promise<Array<ValidationError>>): ValidationFunction =>
		async (fileData: FileData) => {
			const errors: Array<ValidationError> = await func(fileData);

			return {
				title,
				errors: errors.length > 0 ? errors : null,
			}
		};

type CheckFunc = (fileData: FileData, tomData?: ?TOMData) => Promise<Array<ValidationError>>;

const checkTitles: CheckFunc = async ({ title: { titleTag, metadata, h1 } }) => {
	const errors = [];

	if (!titleTag) errors.push(makeError('Title is missing in <title> tag.'));
	if (!metadata) errors.push(makeError('Title is missing in "dcterms.title" metadata.'));
	if (!h1) errors.push(makeError('Title is missing in <h1> tag.'));

	if (titleTag !== metadata || titleTag !== h1 || metadata !== h1) {
		errors.push(makeError('Titles do not all match:', [
			{ header: 'title tag:', message: titleTag },
			{ header: '"dcterms.title" metadata:', message: metadata },
			{ header: 'h1 tag:', message: h1},
		]))
	}

	return errors;
};
const checkDates: CheckFunc = async ({ date: { top, bottom } }) => {
	const errors = [];

	if (!top) errors.push(makeError('Date in missing in "dcterms.modified" metadata.'));
	if (!bottom) errors.push(makeError('Date in missing in the <time> tag (at the bottom of the page).'));

	if (top !== bottom) {
		errors.push(makeError('Dates do not match:', [
			{ header: 'Top (metadata):', message: top },
			{ header: 'Bottom (<time> tag):', message: bottom },
		]));
	}

	return errors;
};
const checkLangLink: CheckFunc = async ({ path, langLink }) => {
	const errors = [];
	const filename = basename(path);
	const otherLang = filename.replace(/.+-([ef])\.html/, '$1') === 'e' ? 'f' : 'e';
	const expectedLangLink = filename.replace(/-([ef])\.html/, `-${otherLang}.html`);

	if (langLink !== expectedLangLink) {
		errors.push(makeError('Other language link does not match what is expected:', [
			{ header: 'Expected:', message: expectedLangLink },
			{ header: 'Actual:', message: langLink },
		]));
	}

	return errors;
};
const checkBreadcrumbs: CheckFunc = async ({ breadcrumbs: { expected, actual } }) => {
	const errors = [];

	for (const [i, expectedBc] of expected.entries()) {
		if (!actual[i]) {
			errors.push(makeError('Breadcrumb missing:', [expectedBc]));
			continue;
		}

		if (expectedBc !== actual[i]) {
			errors.push(makeError('Breadcrumb link is different from what is expected:', [
				{ header: 'Expected:', message: expectedBc },
				{ header: 'Actual:', message: actual[i] },
			]));
		}
	}

	return errors;
};
const checkSecMenu: CheckFunc = async ({ path, secMenu }, tomData: TOMData) => {
	const errors = [];
	const lang = basename(path).replace(/.+-([ef])\.html/, '$1') === 'e' ? 'e' : 'f';
	const expectedSecMenu = tomData.secMenu[lang];

	for (const [ i, expectedEntry ] of expectedSecMenu.entries()) {
		if (!secMenu[i]) {
			errors.push(makeError('Section menu entry is missing:', [expectedEntry]));
			continue;
		}

		if (expectedEntry.text !== secMenu[i].text) {
			errors.push(makeError('Text of section menu entry differs from what is on the home page:', [
				{ header: 'Expected:', message: expectedEntry.text },
				{ header: 'Actual:', message: secMenu[i].text },
			]));
		}
		if (expectedEntry.href !== secMenu[i].href) {
			errors.push(makeError('Href of section menu entry differs from what is on the home page:', [
				{ header: 'Expected:', message: expectedEntry.href },
				{ header: 'Actual:', message: secMenu[i].href },
			]));
		}

		if (i === expectedSecMenu.length - 1 && !!secMenu[i + 1]) { // if last index, check if there are more entries in actual
			const extraEntries = secMenu.slice(i + 1);

			for (const extraEntry of extraEntries) {
				errors.push(makeError('Section menu has an entry that is not on the home page (either '
					+ 'the link hasn\'t been added to the home page or the '
					+ 'page has been deleted but not removed from the section menu):', [
					{ header: 'Text:', message: extraEntry.text },
					{ header: 'Href:', message: extraEntry.href },
				]));
			}
		}
	}

	return errors;
};
const checkNavs: CheckFunc = async (fileData, tomData: TOMData) => {
	const errors = [];

	// todo
	// if different from eachother: "navs are different when they should be the same: top: [topNav], bottom: [bottomNav]"
	// if next/prev doesn't sync up: "prevPage/nextPage's next/prev page should link to this page but doesn't. Expected: [currentPage], actual"

	return errors;
};
const checkToC: CheckFunc = async ({ toc, headers }) => {
	const errors = [];

	const levelMap = {
		0: 'h2',
		1: 'h3',
		2: 'h4',
		3: 'h5',
	};

	const { headersById, noIdHeaders } = headers.reduce((acc, header) => {
		if (!header.id) {
			acc.noIdHeaders.push(header);
		} else {
			acc.headersById[header.id] = { text: header.text, tag: header.tag };
		}

		return acc;
	}, { headersById: {}, noIdHeaders: [] });

	for (const [ level, entries ] of toc.entries()) {
		for (const tocEntry of entries) {
			// toc parsing error?
			if (!tocEntry.href) {
				errors.push(makeError('No href was found for the following ToC entry:', [tocEntry.text]));

				continue;
			}

			const headerId = tocEntry.href.replace('#', '');
			const correspondingHeader = headersById[headerId];

			if (!correspondingHeader) {
				errors.push(makeError('ToC entry has an invalid href:', [
					{ header: 'Text:', message: tocEntry.text },
					{ header: 'Href:', message: tocEntry.href },
				]));

				continue;
			}

			// toc text doesn't match header
			if (tocEntry.text !== correspondingHeader.text) {
				errors.push(makeError('ToC entry\'s text differs from the corresponding header:', [
					{ header: 'ToC:', message: tocEntry.text },
					{ header: 'Header:', message: correspondingHeader.text },
				]));
			}

			// header tag doesn't correspond to toc level
			if (correspondingHeader.tag !== levelMap[level]) {
				errors.push(makeError('Header tag differs from what is expected:', [
					{ header: 'Expected:', message: levelMap[level] },
					{ header: 'Actual:', message: tocEntry.tag },
				]));
			}

			delete headersById[headerId];
		}
	}
	const remainingHeaders = Object.entries(headersById);

	if (remainingHeaders.length > 0) {
		// header has no corresponding toc entry
		for (const [ id, { text } ] of remainingHeaders) {
			errors.push(makeError('Header has no ToC entry corresponding to it\'s id:', [
				{ header: 'Header:', message: text },
				{ header: 'Id:', message: id },
			]));
		}
	}

	if (noIdHeaders.length > 0) {
		// header has no id
		for (const header of noIdHeaders) {
			errors.push(makeError('The following header has no id:', [header.text]));
		}
	}

	// todo: add checking for duplicates

	return errors;
};

/*
 * Latest todo:
 *  -Validation check funcs are done except for navs
 *  -Need to implement them in Validator
 *  -Can't use makeValidateFunc, so will have to slightly rewrite things
 *  -Once the validator seems good, adapt the React components to handle the new shape(s)
 *  -Implement filters once everything else seems good
 */
export default class Validator implements ValidatorInterface, ProgressTracking {
	progress = 0; // files completed, for progress bar

	constructor(tomData: TOMData, validationFuncs: { [validationTitle: string]: Function }) {
		this.tomData = tomData;
		this.validations = validationFuncs;
	}

	async performValidations(): Promise<Array<ValidationResult>> {

	}
	async validatePage(fileData): Promise<PageResults> {
		const pageResults: PageResults = [];

		//
		// do things
		// ...

		this.incrementProgress();
		return pageResults;
	}
	async validateTOM(): Promise<TOMResults> {
		const validationTasks: Array<Promise<PageResults>> =
			Object.values(this.tomData.files)
				.map((file) => this.validatePage(file));

		return await Promise.all(validationTasks);
	}

	incrementProgress() {
		this.progress += 1;
	}
	getProgress() {
		return this.progress;
	}
	resetProgress() {
		this.progress = 0;
	}
}