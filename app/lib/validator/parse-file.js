// @flow
import cheerio from 'cheerio';
import { basename, dirname, join, relative } from 'path';
import { readFile } from 'fs-extra';
import { wrapContent } from './util';
import { FileData, TOMData } from './get-tom-data';

export const getTitles = async ($) => {
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

export const getDates = async ($) => {
	const top = ($('meta')
		.filter((i, meta) => meta.attribs.name === 'dcterms.modified')
		.first()
		.attr('content') || '')
		.trim();
	const bottom = $('time').first().text();

	return { top, bottom };
};

export const getlangLink = async ($) => {
	const langLinkRef = $('#cn-cmb1 > a');

	return langLinkRef.length > 0 ? langLinkRef.first().attr('href') : '';
};

export const getBreadcrumbs = async ($, path, parentData) => {
	const pageDir = dirname(path);

	const actual =
		$('#cn-bcrumb > ol > li > a').filter((i) => i !== 0).toArray()
			.map((bcrumb) => (bcrumb.attribs.href || '').replace(/\//g, '\\'));

	const expected =
		[ ...parentData.breadcrumbs.expected, parentData.path ]
			.map((bcrumb) => relative(pageDir, bcrumb));

	return { actual, expected }
};

export const getSecMenu = async ($) =>
	$('div.module-menu-section')
		.first()
		.find('ul > li > a')
		.toArray()
		.map((a) => a.attribs.href.replace(/\//g, '\\'));

export const getNavs = async ($, path, errors) => {
	const navsRef = $('.embedded-nav');

	if (navsRef.length === 0) {
		return {};
	}

	const navRef = navsRef.filter((i) => i === 0 || i === navsRef.length - 1); // in case there are extra 'embedded-nav's

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
					errors.push({ filename: path, error: `Error parsing nav.\nitemText: ${itemText}\nitemLink: ${itemLink}` });
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

export const getToC = async ($) => {
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

		const tocItems = ulRef.children()
			.toArray()
			.map((li) => ({
				href: $(li).children('a').first().attr('href'),
				text: $(li).text(),
			}));

		itemsByLevel[listLevel].push(tocItems); // check for <a> tag in case some landing pages have lists?
	});

	return itemsByLevel;
};

export const getHeaders = async ($) => {
	$('h2,h3,h4,h5').toArray().map((header) => {
		const headerRef = $(header);

		const tag = header.tagName;
		const text = headerRef.html();
		const id = headerRef.attr('id') || '';

		return { tag, text, id };
	});
};

export const getChildren = async ($, path, tomName) => {
	const contentRef = $('div#__main-content');

	const fileName = basename(path);
	const getNormalChildren = () => contentRef
		.find('li > a')
		.toArray()
		.map(a => ({
			href: join(`${path}/..`, a.attribs.href.trim()),
			text: $(a).text(),
		}));

	// TOM56 & 4095 have abnormal "children" structure
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
					.map(a => ({
						href: join(`${path}/..`, a.attribs.href.trim()),
						text: $(a).text(),
					}));
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
					.toArray()
					.map(li => {
						const a = $(li).children('a').get(0);
						const href = join(`${path}/..`, a.attribs.href.trim());
						const text = $(a).text();

						return { href, text };
					});
			} else {
				return getNormalChildren();
			}
		}
	}
};