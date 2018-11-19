// @flow
import { basename } from 'path';
import {
	AdditionalErrorMessage,
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
import { ProgressTracker } from '../../sagas/validator/progress';


const makeError = (message: string, additionalMessages?: Array<AdditionalErrorMessage> = []): ValidationError => ({
	message,
	additionalMessages
});

type CheckFunc = (fileData: FileData, tomData?: ?TOMData) => Promise<Array<ValidationError>>;

class ValidationCheck {
	errors: Array<ValidationError> = [];

	constructor(title: string) {
		this.title = title;
	}

	pushError(message, additionalMessages) {
		this.errors.push(makeError(message, additionalMessages));
	}

	pushErrorIf(comparisonBool: boolean, message, additionalMessages): boolean {
		if (comparisonBool) {
			this.pushError(message, additionalMessages);
		}
		return comparisonBool;
	}

	getResults() {
		return {
			title: this.title,
			errors: this.errors,
		}
	}
}

const checkTitles: CheckFunc = async ({ title: { titleTag, metadata, h1 } }) => {
	const validate = new ValidationCheck('Title');

	validate.pushErrorIf(!titleTag, 'Title is missing in <title> tag.');
	validate.pushErrorIf(!metadata, 'Title is missing in "dcterms.title" metadata.');
	validate.pushErrorIf(!h1, 'Title is missing in <h1> tag.');
	validate.pushErrorIf(titleTag !== metadata || titleTag !== h1 || metadata !== h1,
		'Titles do not all match:', [
			{ header: 'title tag:', message: titleTag },
			{ header: '"dcterms.title" metadata:', message: metadata },
			{ header: 'h1 tag:', message: h1},
		]);

	return validate.getResults();
};
const checkDates: CheckFunc = async ({ date: { top, bottom } }) => {
	const validate = new ValidationCheck('Date');

	validate.pushErrorIf(!top, 'Date in missing in "dcterms.modified" metadata.');
	validate.pushErrorIf(!bottom, 'Date in missing in the <time> tag (at the bottom of the page).');
	validate.pushErrorIf(top !== bottom, 'Dates do not match:', [
		{ header: 'Top (metadata):', message: top },
		{ header: 'Bottom (<time> tag):', message: bottom },
	]);

	return validate.getResults();
};
const checkLangLink: CheckFunc = async ({ path, langLink }) => {
	const validate = new ValidationCheck('Language link');

	const filename = basename(path);
	const otherLang = filename.replace(/.+-([ef])\.html/, '$1') === 'e' ? 'f' : 'e';
	const expectedLangLink = filename.replace(/-([ef])\.html/, `-${otherLang}.html`);

	validate.pushErrorIf(langLink !== expectedLangLink, 'Other language link does not match what is expected:', [
		{ header: 'Expected:', message: expectedLangLink },
		{ header: 'Actual:', message: langLink },
	]);

	return validate.getResults();
};
const checkBreadcrumbs: CheckFunc = async ({ breadcrumbs: { expected, actual } }) => {
	const validate = new ValidationCheck('Breadcrumbs');

	for (const [i, expectedBc] of expected.entries()) {
		const isMissing = validate.pushErrorIf(!actual[i], 'Breadcrumb missing:', [expectedBc]); // returns boolean value passed to it
		if (isMissing) continue;

		validate.pushErrorIf(expectedBc !== actual[i], 'Breadcrumb link is different from what is expected:', [
			{ header: 'Expected:', message: expectedBc },
			{ header: 'Actual:', message: actual[i] },
		]);
	}

	return validate.getResults();
};

const checkSecMenu: CheckFunc = async ({ path, secMenu }, tomData: TOMData) => {
	const validate = new ValidationCheck('Section menu');
	const lang = basename(path).replace(/.+-([ef])\.html/, '$1') === 'e' ? 'e' : 'f';
	const expectedSecMenu = tomData.secMenu[lang];

	for (const [ i, expectedItem ] of expectedSecMenu.entries()) {
		const itemIsMissing =
			validate.pushErrorIf(!secMenu[i], 'Section menu item is missing:', [expectedItem]);
		if (itemIsMissing) continue;

		validate.pushErrorIf(expectedItem.text !== secMenu[i].text,
			'Text of section menu item differs from what is on the home page:', [
				{ header: 'Expected:', message: expectedItem.text },
				{ header: 'Actual:', message: secMenu[i].text },
			]);
		validate.pushErrorIf(expectedItem.href !== secMenu[i].href,
			'Href of section menu item differs from what is on the home page:', [
				{ header: 'Expected:', message: expectedItem.href },
				{ header: 'Actual:', message: secMenu[i].href },
			]);

		validate.pushErrorIf();
		validate.pushErrorIf();

		if (i === expectedSecMenu.length - 1 && !!secMenu[i + 1]) { // if last index, check if there are more entries in actual
			const extraItems = secMenu.slice(i + 1);

			for (const extraItem of extraItems) {
				validate.pushError('Section menu has an item that is not on the home page (either '
					+ 'the link hasn\'t been added to the home page or the '
					+ 'page has been deleted but not removed from the section menu):', [
					{ header: 'Text:', message: extraItem.text },
					{ header: 'Href:', message: extraItem.href },
				]);
			}
		}
	}

	return validate.getResults();
};
const checkNavs: CheckFunc = async (fileData: FileData, tomData: TOMData) => {
	const validate = new ValidationCheck('Navigation buttons');

	// todo
	// if different from eachother: "navs are different when they should be the same: top: [topNav], bottom: [bottomNav]"
	// if next/prev doesn't sync up: "prevPage/nextPage's next/prev page should link to this page but doesn't. Expected: [currentPage], actual"

	return validate.getResults();
};
const checkToC: CheckFunc = async ({ toc, headers }) => {
	const validate = new ValidationCheck('Table of contents');

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
		for (const tocItem of entries) {
			// check if href is missing
			const hrefIsMissing =
				validate.pushErrorIf(!tocItem.href,
					'No href was found for the following ToC item:',
					[tocItem.text]
				);
			if (hrefIsMissing) continue;

			// check if href is invalid
			const headerId = tocItem.href.replace('#', '');
			const correspondingHeader = headersById[headerId];

			const hrefIsInvalid = validate.pushErrorIf(!correspondingHeader,
				'ToC item has an invalid href:', [
					{ header: 'Text:', message: tocItem.text },
					{ header: 'Href:', message: tocItem.href },
				]);
			if (hrefIsInvalid) continue;

			// check if toc text doesn't match header
			validate.pushErrorIf(tocItem.text !== correspondingHeader.text,
				'ToC item\'s text differs from the corresponding header:', [
					{ header: 'ToC:', message: tocItem.text },
					{ header: 'Header:', message: correspondingHeader.text },
				]);

			// check if header tag doesn't correspond to toc level
			validate.pushErrorIf(correspondingHeader.tag !== levelMap[level],
				'Header tag differs from what is expected based on the ToC:', [
					{ header: 'Expected:', message: levelMap[level] },
					{ header: 'Actual:', message: tocItem.tag },
				]);

			// remove headers with an associated toc entry to see if any are left over
			delete headersById[headerId];
		}
	}
	const remainingHeaders = Object.entries(headersById);

	if (remainingHeaders.length > 0) {
		// header has no corresponding toc item
		for (const [ id, { text } ] of remainingHeaders) {
			validate.pushError('Header has no ToC item corresponding to it\'s id:', [
				{ header: 'Header:', message: text },
				{ header: 'Id:', message: id },
			]);
		}
	}

	if (noIdHeaders.length > 0) {
		// header has no id
		for (const header of noIdHeaders) {
			validate.pushError('The following header has no id:', [header.text]);
		}
	}

	// todo: add checking for duplicates

	return validate.getResults();
};

class PageValidator {
	results: Array<ValidationResult> = [];

	constructor(fileData, tomData, validations) {
		this.fileData = fileData;
		this.tomData = tomData;
		this.validations = validations;
	}

	async performValidations() {
		for (const validate of this.validations) {
			const validationResults = await validate(this.fileData, this.tomData);
			if (validationResults.errors.length > 0) {
				this.results.push(validationResults);
			}
		}
	}

	getResults() {
		return {
			path: this.fileData.path,
			results: this.results,
		};
	}
}

export const validateTOM =
	async (files: Array<FileData>, tomData: TOMData, progress: ProgressTracker): TOMResults => {
		const results: TOMResults = [];

		// for each file, perform validations, add to results
		// return results
	};

