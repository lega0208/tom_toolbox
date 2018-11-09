// @flow
import cheerio from 'cheerio';
import { basename, dirname, join, relative } from 'path';
import { readFile } from 'fs-extra';
import { wrapContent } from './util';
import { FileData, TOMData } from './get-tom-data';

const getTitles = async ($) => {
	const titleTag =
		$('title').text().replace(/\s+/g, ' ').trim();

	const metaData =
		($('meta')
				.filter((i, meta) => meta.attribs.name === 'dcterms.title')
				.first()
				.attr('content')
			|| '').replace(/\s+/g, ' ').trim();

	const h1 =
		$('h1').first().text().replace(/\s+/g, ' ').trim();

	return {
		titleTag,
		metaData,
		h1,
	}
};

const getDates = async ($) => {
	const top = $('meta')
		.filter((i, meta) => meta.attribs.name === 'dcterms.modified')
		.first()
		.attr('content')
		.trim();
	const bottom = $('time').first().text();

	return { top, bottom };
};

const getlangLink = async ($) => {
	const langLinkRef = $('#cn-cmb1 > a');

	return langLinkRef.length > 0 ? langLinkRef.first().attr('href') : '';
};

const getBreadcrumbs = async ($, path, parentData) => {
	const pageDir = dirname(path);

	const actual =
		$('#cn-bcrumb > ol > li > a').filter((i) => i !== 0).toArray()
			.map((bcrumb) => bcrumb.attribs.href.replace(/\//g, '\\'));

	const expected =
		[ ...parentData.breadcrumbs, parentData.path ]
			.map((bcrumb) => relative(pageDir, bcrumb));

	return { actual, expected }
};

const getSecMenu = async ($) =>
	$('div.module-menu-section')
		.first()
		.find('ul > li > a')
		.toArray()
		.map((a) => a.attribs.href.replace(/\//g, '\\'));

const getNavs = async ($) => {
	const navRef = $('.embedded-nav');

	if (navRef.length === 0) {
		return {};
	}

	const navObjects = [];

	navRef.each((i, nav) => {
		const navItems = $(nav).find('a');
		navObjects.push({});

		navItems.each((_i, navItem) => {
			const navItemRef = $(navItem);
			const itemText = navItemRef.html();
			const itemLink = navItemRef.attr('href');

			const prevPageRegex = /previous|pr&eacute;c&eacute;dente|précédente/i;
			const homePageRegex = /return|retourner/i;
			const nextPageRegex = /next|suivante/i;

			switch (true) {
				case prevPageRegex.test(itemText):
					navObjects[i]['prevPage'] = itemLink;
					break;
				case homePageRegex.test(itemText):
					navObjects[i]['homePage'] = itemLink;
					break;
				case nextPageRegex.test(itemText):
					navObjects[i]['nextPage'] = itemLink;
					break;
				default:
					console.error('An error occurred while parsing nav.');
					return [];
			}
		});
	});

	const navs = {};

	navObjects.forEach((nav, i) => {
		if (i === 0) {
			navs.top = nav;
		} else if (i === 1) {
			navs.bottom = nav;
		}
	});

	return navs;
};

const getToC = async ($) => {
	const tocRef = $('.module-table-contents');

	if (tocRef.length === 0) return [];

	const itemsByLevel = [];
	const uls = tocRef.find('ul');

	uls.each((i, ul) => {
		const ulRef = $(ul);
		const listLevel =
			ulRef.parentsUntil(tocRef)
				.filter('ul')
				.length; // + 1 if you want the actual level

		if (!itemsByLevel[listLevel]) itemsByLevel[listLevel] = [];

		itemsByLevel[listLevel].push(ulRef.children()); // check for <a> tag in case some landing pages have lists?
	});

	return itemsByLevel;
};

const getHeaders = async ($) => {
	$('h2,h3,h4,h5').toArray().map((header) => {
		const headerRef = $(header);

		const tag = header.tagName;
		const text = headerRef.html();
		const id = headerRef.attr('id') || '';

		return { tag, text, id };
	});
};

const getChildren = async ($, path, tomName) => {
	const contentRef = $('div#__main-content');

	const fileName = basename(path);
	const getNormalChildren = () => contentRef
		.find('li > a')
		.toArray()
		.map(a => join(`${path}/..`, a.attribs.href));

	if (!/TOM(?:56|4095)/.test(tomName)) {
		return getNormalChildren();
	} else { // They have landing pages that don't conform
		const regex = /asl_5600-[ef]\.html/;
		if (tomName === 'TOM56') {
			if (regex.test(fileName)) {
				return contentRef
					.find('li > a')
					.filter((i, el) => $(el).find('strong').length > 0) // only links with strong are direct children
					.toArray()
					.map(a => join(`${path}/..`, a.attribs.href));
			} else {
				return getNormalChildren();
			}
		} else if (tomName === 'TOM4095') {
			const regex = /4095\.\(11\)_dectax-[ef]\.html|4095\.\(12\)_landing-[ef]\.html/;

			if (regex.test(fileName)) {
				return contentRef
					.children()
					.first()    // ul
					.children() // lis
					.map((i, li) => $(li).children('a').get(0))
					.toArray()
					.map(a => join(`${path}/..`, a.attribs.href));
			} else {
				return getNormalChildren();
			}
		}
	}
};

const parseNewData = async (path, parentData, tomName) => {
	const fileName = basename(path);
	const fileContents = await readFile(filePath, 'utf8');
	const pageContents = (await wrapContent(fileContents, fileName) || fileContents);
	const $ = cheerio.load(pageContents, { decodeEntities: false });

	return {
		lastUpdated: Date.now(),
		title: await getTitles($),
		date: await getDates($),
		langLink: await getlangLink($),
		breadcrumbs: await getBreadcrumbs($, path, parentData),
		secMenu: await getSecMenu($),
		nav: await getNavs($),
		toc: await getToC($),
		headers: await getHeaders($),
		children: await getChildren($, path, tomName),
	}
};

const createNewFileData = async (path, parentData, tomName) => ({
	...(await parseNewData(path, parentData, tomName)),
	path,
	depth: parentData.depth + 1,
	isLanding: false,
	parent: parentData.path,
});

export async function updateCachedData(path: string, tomData: TOMData): Promise<FileData> {
	const { files } = tomData;

	const oldFileData: FileData = files[path];
	const parentData: ?FileData = oldFileData.parent ? files[oldFileData.parent] : null;

	const newFileData = await parseNewData(path, parentData, tomData.tomName);

	const combinedData: FileData = { ...oldFileData, ...newFileData };

	if (oldFileData.isLanding) {
		// check that each href was in the old children
		//  if not, check if the file existed in the tomData, and if not, parse and add the file to tomData.files
		const oldChildren = oldFileData.children;
		const newChildren = newFileData.children;

		const addedChildren = newChildren.filter((child) => !oldChildren.includes(child));
		const removedChildren = oldChildren.filter((child) => !newChildren.includes(child));

		for (const child of addedChildren) {
			if (!files[child]) {
				files[child] = await createNewFileData(child, combinedData, tomData.tomName);
			}
		}

		for (const child of removedChildren) {
			if (files[child]) {
				delete files[child];
			}
		}

		if (oldFileData.isHomepage) {
			// if children changed, update tomData secMenu
			const childrenChanged = oldChildren.reduce((acc, child, i) => newChildren[i] !== child ? true : acc, false);
			if (childrenChanged) {
				// do the things here
			}
		}
	}

	return combinedData;
}