// @flow
import fs from 'fs-extra';
import path from 'path';
import cheerio from 'cheerio';
import { tomDataType } from './types';

export default async function loadFile(filePath): tomDataType {
	const fileContents = await fs.readFile(path.resolve(filePath), 'utf-8');
	const fileName = path.basename(filePath);

	const $ = cheerio.load(fileContents, { decodeEntities: false });

	return {
		title: $('title').text(),
		filename: fileName,
		lang: $('html').attr('lang'),
		wetVersion: 2, // todo: find a way to tell which wetVersion, or if too complicated, use a version toggle button
		metadata: await parseMetadata($),
		langLink: $('#cn-cmb1 > a').attr('href'),
		breadcrumbs: await parseBreadcrumb($),
		nav: await parseNav($),
		toc: await parseToc($),
		secMenu: await parseSecMenu($),
	};
}

async function parseMetadata($) {
	// map of metadata "name" attribute to the equivalent prop names we'll be using
	const dataMap = {
		'ManualHomePage': 'isHomepage',
		'ManualID': 'manualId',
		'description': 'description',
		'dc.description': 'description',
		'keywords': 'keywords',
		'dc.creator': 'creator',
		'dc.publisher': 'publisher',
		'dcterms.issued': 'issued',
		'dcterms.modified': 'modified',
	};
	const metadata = {};

	$('meta').each((i, elem) => {
		const elemRef = $(elem);
		const metaName = elemRef.attr('name');

		if (Object.keys(dataMap).includes(metaName)) {
			const dataProp = dataMap[metaName];
			metadata[dataProp] = elemRef.attr('content');
		}
	});

	return metadata;
}

async function parseBreadcrumb($) {
	const breadcrumbs: Array<linkType> = [];
	const breadcrumbItems = $('#cn-bcrumb > ol').first().find('a');

	breadcrumbItems.each((i, bcItem) => breadcrumbs.push({
		text: $(bcItem).html(),
		href: $(bcItem).attr('href')
	}));

	return breadcrumbs;
}

async function parseNav($) {
	const navObject = {};
	const navItems = $('.embedded-nav').first().find('a');

	navItems.each((i, navItem) => {
		const navItemRef = $(navItem);
		const itemText = navItemRef.html();
		const itemLink = navItemRef.attr('href');

		const prevPageRegex = /previous|pr&eacute;c&eacute;dente|précédente/i;
		const homePageRegex = /return|retourner/i;
		const nextPageRegex = /next|suivante/i;

		switch (true) {
			case prevPageRegex.test(itemText):
				navObject['prevPage'] = itemLink;
				break;
			case homePageRegex.test(itemText):
				navObject['homePage'] = itemLink;
				break;
			case nextPageRegex.test(itemText):
				navObject['nextPage'] = itemLink;
				break;
			default:
				console.error('Failed to parse nav');
		}
	});

	// Insert check for bottom nav?

	return navObject;
}

function recurseTocItem(tocItem, $) {
	const tocAnchorRef = tocItem.children('a').first();
	const tocItemObject = {
		text: tocAnchorRef.html(),
		href: tocAnchorRef.attr('href'),
	};

	if (tocItem.children('ul').length) {
		const children = [];

		const tocItemChildrenRef = tocItem.children('ul').first().children('li');
		tocItemChildrenRef.each(
			(i, tocItemChild) => children.push(recurseTocItem($(tocItemChild), $))
		);

		return {
			...tocItemObject,
			children,
		};
	}

	return tocItemObject;
}

async function parseToc($) {
	const tocItems = [];
	const tocItemsRef = $('div.module-table-contents > ul').first().children();

	tocItemsRef.each(
		(i, tocItem) => tocItems.push(recurseTocItem($(tocItem), $))
	);

	console.log(tocItems);

	return tocItems;
}

async function parseSecMenu($) {
	const secMenu = [];
	const secMenuItems = $('div.module-menu-section').find('ul').first().find('a');

	secMenuItems.each((i, secMenuItem) =>
		secMenu.push({ text: $(secMenuItem).text(), href: $(secMenuItem).attr('href') })
	);

	return secMenu;
}