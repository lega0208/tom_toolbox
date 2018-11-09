import { basename, dirname, relative } from 'path';
import { pathExists } from 'fs-extra';

export const checkTitle = async ($) => {
	const errors = [];
	const title = $('title')
		.text()
		.replace(/\s+/g, ' ')
		.trim();

	if (title.includes('<abbr')) {
		errors.push({ message: '<title> tag contains <abbr> tags, but only text is allowed.' });

		return {
			type: 'Title',
			errors,
		}
	} else {
		const metaTitle = ($('meta')
			.filter((i, meta) => meta.attribs.name === 'dcterms.title')
			.first()
			.attr('content') || '')
			.replace(/\s+/g, ' ')
			.trim();
		const h1Title = $('h1')
			.first()
			.text()
			.replace(/\s+/g, ' ')
			.trim();

		if (metaTitle !== title) {
			errors.push({
				message: 'Title in "dcterms.title" metadata doesn\'t match the title tag.',
				expected: title,
				actual: metaTitle,
			});
		}

		if (h1Title !== title) {
			errors.push({
				message: 'Title in h1 tag doesn\'t match the title tag.',
				expected: title,
				actual: h1Title,
			});
		}

		return errors.length > 0
			? errors
			: null
	}
};

export const checkDate = async ($, path) => {
	try {
		const metaDate = $('meta')
			.filter((i, meta) => meta.attribs.name === 'dcterms.modified')
			.first()
			.attr('content')
			.trim();
		const bottomDate = $('time').first().text();

		return metaDate !== bottomDate
			? [{ message: 'The modified date in the metadata doesn\'t match the date at the bottom of the page.' }]
			: null;
	} catch (e) {
		console.error(`Error in ${basename(path)}`);
		console.error(e);

		return [{ message: 'Error reading "dcterms.modified" metadata.' }]
	}
};

export const checkLangLink = async ($, path) => {
	const langLinkRef = $('#cn-cmb1 > a');
	const langLink = (langLinkRef.length > 0 ? langLinkRef.first().attr('href') : null);

	if (!langLink) {
		return [{ message: 'Error parsing language link, verify that it is correct.' }]
	}
	const errors = [];
	const comparisonRegex = /(.+?)-([ef])\.html/;

	const filenameResult = comparisonRegex.exec(basename(path));
	const langLinkResult = comparisonRegex.exec(langLink);

	if (!filenameResult)
		console.error('Regex matched nothing while checking langLink in ' + path);

	if (!langLinkResult)
		errors.push({ message: 'Error parsing language link, verify that it is correct.' });

	if (filenameResult && langLinkResult && filenameResult[1] !== langLinkResult[1]) {
		const otherLangSuffix = (filenameResult[2] === 'e' ? '-f.html' : '-e.html');

		errors.push({
			message: 'Error in language link:',
			expected: `${filenameResult[1]}${otherLangSuffix}`,
			actual: `${langLinkResult[1]}${otherLangSuffix}`,
		});
	}

	return errors.length > 0
		? errors
		: null;
};

export const checkBreadcrumbs = async ($, breadcrumbs, path) => {
	const errors = [];
	const pageDir = dirname(path);

	const actual = $('#cn-bcrumb > ol > li > a')
		.filter((i) => i !== 0)
		.toArray()
		.map((bcrumb) => bcrumb.attribs.href.replace(/\//g, '\\'));
	const expected = breadcrumbs.map((bcrumb) => relative(pageDir, bcrumb));

	expected.forEach((bcrumb, i) => {
		if (!actual[i]) {
			errors.push({
				message: 'Breadcrumb missing.',
				expected: expected[i],
			})
		} else if (bcrumb !== actual[i]) {
			errors.push({
				message: 'Breadcrumb entry does not match what is expected:',
				actual: actual[i],
				expected: bcrumb,
			})
		}
	});

	return errors.length > 0
		? errors
		: null;
};

export const checkSecMenu = async ($, secMenu, path) => {
	const errors = [];
	const pageDir = dirname(path);

	const expected = secMenu.map((item) => relative(pageDir, item));
	const actual =
		$('div.module-menu-section')
			.first()
			.find('ul > li > a')
			.toArray()
			.map((a) => a.attribs.href.replace(/\//g, '\\'));

	expected.forEach((item, i) => {
		if (!actual[i]) {
			errors.push({
				message: 'Entry missing.',
				expected: item,
			})
		} else if (item !== actual[i]) {
			errors.push({
				message: 'Entry does not match what is expected:',
				actual: actual[i],
				expected: item,
			})
		}
	});

	return errors.length > 0
		? errors
		: null;
};

export const checkChildren = async (children, rootDir) => {
	const errors = [];
	const validChildren = [];

	for (const child of children) {
		if (!(await pathExists(child))) {
			errors.push({
				message: `Link "${child.replace(`${rootDir}\\`, '')}" is invalid.`
			});
		} else {
			validChildren.push(child);
		}
	}

	const results = errors.length > 0
		? errors
		: null;

	return [ validChildren, results ];
};

export const checkNavs = (navs) => {
	const errors = [];

	if (navs.length < 2) {
		switch (navs.length) {
			case 0 :
				errors.push({ message: 'No nav found.' });
				break;
			case 1:
				errors.push({ message: 'Only 1 nav found.' })
		}
	}

	return errors.length > 0
		? errors
		: null;
};

export async function checkHeaders($, path) {
	const errors = [];
	const tocRef = $('.module-table-contents');

	if (tocRef.length === 0) return null; // if no ToC, nothing to check

	const itemsByLevel = await sortTocLevels($, tocRef);

	const levelMap = {
		0: 'h2',
		1: 'h3',
		2: 'h4',
		3: 'h5',
	};

	itemsByLevel.forEach((items, i) => { // Array.prototype.forEach
		for (const lisRef of items) {
			lisRef.each((j, li) => {
				const aRefs = $(li).children('a'); // cheerio.each

				if (aRefs.length === 0) {
					console.log(`No <a>s in ToC in ${basename(path)}?`);
					const liText = $(li).html();
					errors.push({
						message: `No <a> tag found in ToC entry "${liText}" or ToC was nested improperly.`,
						actual: $(li).html(),
					});
					return;
				}

				if (aRefs.length > 1) {
					console.error(`Multiple <a>s in ToC in ${basename(path)}?`)
				}

				const aRef = aRefs.first();
				const aText = aRef.html()
					.replace(/\s+/g, ' ')
					.replace(/<span class="wrap-none">(.+?)<\/span>/g, '$1')
					.trim(); // To reduce noise and false positives
				const href = aRef.attr('href');

				if (!href) {
					errors.push({
						message: `Error reading href in ToC entry "${aText}", this may be caused by multiple <a> tags.`,
						actual: $(li).html(),
					});
					return;
				}

				const headerRef = $(href);

				if (headerRef.length === 0) {
					errors.push({ message: `ToC entry "${aText}" has an invalid href: "${href}".` });
				} else {
					const headerTag = headerRef.get(0).tagName;
					const headerText = headerRef.html()
						.replace(/\s+/g, ' ')
						.replace(/<span class="wrap-none">(.+?)<\/span>/g, '$1')
						.trim(); // To reduce noise and false positives
					if (headerText !== aText) {
						errors.push({
							message: `Header has different text content than its associated ToC entry:`,
							expected: aText,
							actual: headerText,
						});
					}

					if (headerTag !== levelMap[i]) {
						errors.push({
							message: `Header level for "${headerText}" does not correspond to its associated ToC entry:`,
							expected: levelMap[i],
							actual: headerTag,
						});
					}
				}
			});
		}
	});

	return errors.length > 0
		? errors
		: null;
}

async function sortTocLevels($, tocRef) {
	const tocLevels = [];
	const uls = tocRef.find('ul');

	uls.each((i, ul) => {
		const ulRef = $(ul);
		const listLevel =
			ulRef.parentsUntil(tocRef)
				.filter('ul')
				.length; // + 1 if you want the actual level

		if (!tocLevels[listLevel]) tocLevels[listLevel] = [];

		tocLevels[listLevel].push(ulRef.children()); // check for <a> tag in case some landing pages have lists?
	});

	return tocLevels;
}

//export const checkIfLanding = async ($, contentRef, filePath) => {
//	if (/what's new|quoi de neuf/i.test($('title').text()))
//		return false;
//
//	// filter out naked text nodes and textless divs
//	const filteredContent = contentRef.children().filter(
//		(i, el) => !(
//			el.type === 'text'
//			|| (el.tagName === 'div'
//				&& ($(el).text() === '' || el.attribs.class.includes('module-tool')))
//		)
//	);
//
//	// more than 3 top-level elems = probably not a landing
//	if (filteredContent.length > 3) {
//		return false;
//	}
//
//	const nonLandingElems = filteredContent.find(':not(div,ul,li,a,strong,abbr)');
//
//	if (nonLandingElems.length > 4) {
//		return false;
//	}
//
//	const landingLinks = filteredContent.find('ul > li > a');
//
//	if (landingLinks.length > 2) {
//		console.log(`Found landing page: ${basename(filePath)}`);
//		return true;
//	} else {
//		return false;
//	}
//};