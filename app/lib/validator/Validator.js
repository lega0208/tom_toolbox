// @flow
import { basename, dirname, relative, resolve } from 'path';
import { pathExists } from 'fs-extra';
import {
	AdditionalErrorMessage,
	FileData,
	PageResults,
	TOMDataType,
	ValidationError,
	ValidationResult,
} from 'lib/validator/types';

const makeError = (message: string, additionalMessages?: Array<AdditionalErrorMessage> = []): ValidationError => ({
	message,
	additionalMessages
});

type CheckFunc = (fileData: FileData, tomData?: ?TOMDataType) => Promise<Array<ValidationError>>;

class ValidationCheck {
	title: string;
	errors: Array<ValidationError>;

	constructor(title: string) {
		this.title = title;
		this.errors = [];
	}

	pushError(message, additionalMessages) {
		this.errors.push(makeError(message, additionalMessages));
	}

	pushErrorIf(comparisonBool: ?boolean, message, additionalMessages): ?boolean {
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

const checkTitles: CheckFunc = async ({ title: { titleTag, metadata, breadcrumb, h1 } }) => {
	const validate = new ValidationCheck('Title');
	titleTag = titleTag.trim();
	metadata = metadata.trim();
	breadcrumb = breadcrumb.trim();
	h1 = h1.trim();

	validate.pushErrorIf(!titleTag, 'Title is missing in <title> tag.');
	validate.pushErrorIf(!metadata, 'Title is missing in "dcterms.title" metadata.');
	validate.pushErrorIf(!breadcrumb, 'Title is missing in breadcrumbs.');
	validate.pushErrorIf(!h1, 'Title is missing in <h1> tag.');
	validate.pushErrorIf(titleTag !== metadata
		|| titleTag !== h1
		|| metadata !== h1
		|| breadcrumb !== titleTag
		|| breadcrumb !== metadata
		|| breadcrumb !== h1,
		'Titles do not all match:', [
			{ header: 'title tag:', message: titleTag },
			{ header: 'dcterms.title metadata:', message: metadata },
			{ header: 'breadcrumb:', message: breadcrumb },
			{ header: 'h1 tag:', message: h1 },
		]);

	return validate.getResults();
};
const checkDates: CheckFunc = async ({ date: { top, bottom } }) => {
	const validate = new ValidationCheck('Date');

	validate.pushErrorIf(!top, 'Date missing in "dcterms.modified" metadata.');
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

	validate.pushErrorIf(langLink !== expectedLangLink, 'Second language link does not match what is expected:', [
		{ header: 'Expected:', message: expectedLangLink },
		{ header: 'Actual:', message: langLink },
	]);

	return validate.getResults();
};
const checkBreadcrumbs: CheckFunc = async (fileData) => {
	const validate = new ValidationCheck('Breadcrumbs');

	if (fileData.isHomepage) {
		return validate.getResults();
	}

	if (!fileData.breadcrumbs.actual) {
		validate.pushError('No breadcrumbs found');

		return validate.getResults()
	}

	const { expected, actual } = fileData.breadcrumbs;

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
const checkSecMenu: CheckFunc = async (fileData, tomData: TOMDataType) => {
	const validate = new ValidationCheck('Section menu');

	if (fileData.isHomepage) {
		return validate.getResults();
	}

	if (!fileData.secMenu) {
		validate.pushError('Section menu not found.');
		return validate.getResults();
	}

	const lang = basename(fileData.path).replace(/.+-([ef])\.html/, '$1') === 'e' ? 'e' : 'f';
	const dirPath = dirname(`${fileData.path}`);

	const expectedSecMenu =
		tomData.secMenu[lang]
			.map(({ text, href }) => ({ text: text.replace(/\s+/g, ' '), href: resolve(dirname(`${tomData.homePage}-e.html`), href) })); // get abs paths
	const actualSecMenu =
		fileData.secMenu
			.map(({ text, href }) => ({ text: text.replace(/\s+/g, ' '), href: resolve(dirPath, href) }));

	for (const [ i, expectedItem ] of expectedSecMenu.entries()) {
		const itemIsMissing =
			validate.pushErrorIf(!fileData.secMenu[i], 'Section menu item is missing (based on homepage):', [
				{ header: 'Text:', message: expectedItem.text },
				{ header: 'Href:', message: relative(dirPath, expectedItem.href) },
			]);

		if (itemIsMissing) continue;

		validate.pushErrorIf(expectedItem.text.trim() !== actualSecMenu[i].text.trim(),
			'Text of section menu item differs from what is on the home page:',
			[
				{ header: 'Expected:', message: expectedItem.text },
				{ header: 'Actual:', message: fileData.secMenu[i].text },
			]);

		validate.pushErrorIf(expectedItem.href !== actualSecMenu[i].href,
			'Href of section menu item differs from what is on the home page:',
			[
				{ header: 'Expected:', message: relative(dirPath, expectedItem.href) },
				{ header: 'Actual:', message: fileData.secMenu[i].href },
			]);

		// if last index, check if there are more entries in actual
		if (i === expectedSecMenu.length - 1 && !!fileData.secMenu[i + 1]) {
			const extraItems = fileData.secMenu.slice(i + 1);

			for (const extraItem of extraItems) {
				validate.pushError('Section menu has an item that is not on the home page (either '
					+ 'the link hasn\'t been added to the home page or the '
					+ 'page has been deleted but not removed from the section menu):',
					[
						{ header: 'Text:', message: extraItem.text },
						{ header: 'Href:', message: extraItem.href },
					]);
			}
		}
	}

	return validate.getResults();
};
const checkNavs: CheckFunc = async (fileData: FileData, tomData: TOMDataType) => {
	const validate = new ValidationCheck('Navigation buttons');

	if (fileData.isHomepage) {
		return validate.getResults();
	}

	if (!fileData.nav) {
		validate.pushError('No navigation buttons found.');
		return validate.getResults();
	}

	if (!fileData.nav.top) {
		validate.pushError('Top navigation buttons are missing.');
		return validate.getResults();
	}

	if (!fileData.nav.bottom) {
		validate.pushError('Bottom navigation buttons are missing.');
	}

	const { top, bottom } = fileData.nav;

	const absPath = (filePath, relPath) => resolve(dirname(filePath), relPath);
	const relPath = (from, to) => relative(dirname(from), to);

	if (top && top.prevPage) {
		validate.pushErrorIf(bottom && top.prevPage !== bottom.prevPage, 'Top and bottom "Previous page" buttons have different hrefs:', [
			{ header: 'Top:', message: top.prevPage },
			{ header: 'Bottom:', message: bottom && bottom.prevPage }
		]);

		const prevPageData = tomData.files[absPath(fileData.path, top.prevPage)];
		validate.pushErrorIf(!prevPageData, 'Unable to find file linked in "Previous page" button:', [ top.prevPage ]);

		if (prevPageData && !prevPageData.isHomepage && prevPageData.nav) {
			if (!prevPageData.nav.top) {
				console.error(`prevPageData nav found, but no nav.top: ${basename(prevPageData.path)}`);
			} else if (prevPageData.nav.top.nextPage) {
				const nextPageOfPrevPage = absPath(prevPageData.path, prevPageData.nav.top.nextPage);

				validate.pushErrorIf(nextPageOfPrevPage !== fileData.path,
					'The linked "Previous page" should have its "Next page" navigation link to this page.', [
						{ header: 'Previous page:', message: top.prevPage },
						{ header: 'Above file\'s "Next page":', message: prevPageData.nav.top.nextPage },
						{ header: 'Expected:', message: relPath(prevPageData.path, fileData.path) },
					]
				);
			} else if (prevPageData && !prevPageData.isHomepage && !prevPageData.nav) {
				validate.pushError('Navigation buttons not found in the linked "Previous page".', [{
					header: 'Previous page:',
					message: basename(prevPageData.path),
				}]);
			}
		}
	}

	if (top && top.nextPage) {
		validate.pushErrorIf(bottom && top.nextPage !== bottom.nextPage, 'Top and bottom "Next page" buttons have different hrefs:', [
			{ header: 'Top:', message: top.nextPage },
			{ header: 'Bottom:', message: bottom && bottom.nextPage }
		]);

		const nextPageData = tomData.files[absPath(fileData.path, top.nextPage)];
		validate.pushErrorIf(!nextPageData, 'Unable to find file linked in "Next page" button:', [ top.nextPage ]);

		if (nextPageData && nextPageData.nav) {
			if (!nextPageData.nav.top) {
				console.error(`nextPageData nav found, but no nav.top: ${basename(nextPageData.path)}`);
				validate.pushError('Top navigation buttons not found in the linked "Next page".', [{
					header: 'Next page:',
					message: basename(nextPageData.path),
				}]);
			} else if (nextPageData.nav.top.prevPage) {
				const prevPageOfNextPage = absPath(nextPageData.path, nextPageData.nav.top.prevPage);

				validate.pushErrorIf(prevPageOfNextPage !== fileData.path,
					'The file linked as "Next page" should have its "Previous page" buttons link to this page, but doesn\'t:', [
						{ header: 'Next page:', message: top.nextPage },
						{ header: 'Above file\'s "Previous page":', message: nextPageData.nav.top.prevPage },
						{ header: 'Expected":', message: relPath(nextPageData.path, fileData.path) },
					]
				);
			} else {
				validate.pushError('"Previous page" button in the linked "Next page" was not found.', [{
					header: 'Next page:',
					message: basename(nextPageData.path),
				}]);
			}
		}
	}

	return validate.getResults();
};
const checkToC: CheckFunc = async (fileData) => {
	const validate = new ValidationCheck('Table of contents');

	if (fileData.isHomepage || !fileData.toc || !(fileData.toc.length > 0)) {
		return validate.getResults();
	}

	const levelMap = {
		0: 'h2',
		1: 'h3',
		2: 'h4',
		3: 'h5',
	};

	const headersById = fileData.headers.reduce((acc, header) => {
		if (header.id) {
			acc[header.id] = { text: header.text.replace(/\s+/g, ' ').trim(), tag: header.tag };
		}
		return acc;
	}, {});

	for (const [ level, entries ] of fileData.toc.entries()) {
		const tocItems = entries.map((item) => (!item.href && !item.text) ? null : ({
			href: item.href,
			text: item.text.replace(/\s+/g, ' ').trim()
		})).filter((i) => !!i);
		
		for (const tocItem of tocItems) {
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
					{ header: 'Header:', message: correspondingHeader.text },
					{ header: 'Expected:', message: levelMap[level] },
					{ header: 'Actual:', message: correspondingHeader.tag },
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

	// check for duplicated
	fileData.headers
		.sort((a, b) => (a.id || '').localeCompare((b.id || ''))) // sort alphabetically by id
		.reduce((acc, header, i) => {                             // reduce to array of (array of) headers with duplicate ids
				if (header === fileData.headers[i + 1]) {
					acc.push([ header, fileData.header[i + 1] ]);
				}
			return acc;
			}, [])
		.forEach((headers) => {                                    // push error for each header
				validate.pushError('The following headers have duplicated ids. Ids should be unique:', [
					{ header: 'Id:', message: headers[0].id },
					headers[0].text,
					headers[1].text,
				]);
			});

	return validate.getResults();
};

const checkChildren = async ({ path, isLanding, children }) => {
	const validate = new ValidationCheck('Links');
	const pageDir = dirname(path);

	if (!isLanding) {
		return validate.getResults();
	}

	for (const child of children) {
		validate.pushErrorIf(!(await pathExists(child.href)), 'Link is invalid:', [
			{ header: 'Title:', message: child.text },
			{ header: 'Href:', message: relative(pageDir, child.href) },
		]);
	}

	return validate.getResults();
};

export const validatePage = async (fileData, tomData) => {
	const validations = [
		checkTitles,
		checkDates,
		checkLangLink,
		checkBreadcrumbs,
		checkSecMenu,
		checkNavs,
		checkToC,
		checkChildren,
	];

	const validationTasks = validations.map((validation) => validation(fileData, tomData));
	try {
		const results: Array<ValidationResult> =
			(await Promise.all(validationTasks)).filter(({ errors }) => errors.length > 0);

		return {
			path: fileData.path,
			results,
		};
	} catch (e) {
		console.log(`Error validating ${fileData.path}`);
		throw e;
	}
};