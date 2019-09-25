// @flow
import { basename, dirname, join, relative, resolve } from 'path';
import { readFile } from 'fs-extra';

export const getTitles = async ($) => {
	const titleTag = $('title').text().replace(/\s+/g, ' ').trim();

	const metadata =
		($('meta').filter((i, meta) => meta.attribs.name === 'dcterms.title').first().attr('content') || '')
			.replace(/\s+/g, ' ')
			.trim();

	const breadcrumb = $('#wb-bc ol.breadcrumb')
		.children()
		.last()
		.text()
		.replace(/\s+/g, ' ')
		.trim();

	const h1 = $('h1')
		.first()
		.text()
		.replace(/\s+/g, ' ')
		.trim();

	return {
		titleTag,
		metadata,
		breadcrumb,
		h1,
	}
};

export const getDates = async ($) => {
	const top =
		($('meta').filter((i, meta) => meta.attribs.name === 'dcterms.modified').first().attr('content') || '').trim();

	const bottom = $('time').first().text();

	return { top, bottom };
};

export const getlangLink = async ($) => {
	const langLinkRef = $('section#wb-lng a');

	return langLinkRef.length > 0 ? langLinkRef.first().attr('href') : '';
};

export const getBreadcrumbs = async ($, path, parentData) => {
	const pageDir = dirname(path);
	const parentDir = dirname(parentData.path);

	const actual =
		$('#wb-bc ol.breadcrumb > li > a').toArray().slice(3)
			.map((bcrumb) => (bcrumb.attribs.href || '').replace(/\//g, '\\'));

	const absoluteParentExpected =
		parentData.breadcrumbs.expected
			.map((filePath) => resolve(parentDir, filePath));
	const expected =
		[ ...absoluteParentExpected, parentData.path ]
			.map((bcrumb) => relative(pageDir, bcrumb));

	return { actual, expected }
};

export const getSecMenu = async ($) =>
	$('section#section-menu')
		.first()
		.find('ul > li > a')
		.toArray()
		.map((a) => ({
			text: $(a).text(),
			href: a.attribs.href.replace(/\//g, '\\').trim(),
		}));

export const getNavs = async ($, path, errors) => {
	const navsRef =
		$('ul.pager')
			.filter((i, el) => $(el).find('.glyphicon-arrow-left, .glyphicon-arrow-right').length > 0);

	if (navsRef.length === 0) {
		return {};
	}

	const navRef = navsRef.filter((i) => i === 0 || i === navsRef.length - 1); // in case there are extra 'ul.pager's

	const navObjects = [];

	navRef.each((i, nav) => {
		const navItems = $(nav).find('a');
		navObjects.push({});

		navItems.each((_i, navItem) => {
			const navItemRef = $(navItem);
			const itemText = navItemRef.html();
			const itemLink = navItemRef.attr('href');

			const prevPageRegex = /previous|pr&eacute;c&eacute;dente|précédente/i;
			const nextPageRegex = /next|suivante/i;

			switch (true) {
				case prevPageRegex.test(itemText):
					navObjects[i]['prevPage'] = itemLink;
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
	const tocRef = $('.panel.panel-default').filter(
			(i, el) => /table(?:\s+of\s+contents|\s+des\s+mati)/i
				.test($(el).find('.panel-heading > .panel-title').text())
		);

	if (tocRef.length === 0 || tocRef.find('ul > ul').length > 0) return [];

	const itemsByLevel = [];
	const uls = tocRef.find('ul');

	uls.each((i, ul) => {
		const ulRef = $(ul);
		const listLevel =
			ulRef.parentsUntil(tocRef)
				.filter('ul')
				.length; // + 1 if you want the actual level

		if (!itemsByLevel[listLevel]) itemsByLevel[listLevel] = [];

		const tocItems = ulRef.children('li')
			.toArray()
			.map((li) => ({
				href: $(li).children('a').first().attr('href'),
				text: $(li).children('a').first().html(),
			}));

		if (tocItems[0][0] && !tocItems[0][0].href) {
			console.log(tocRef.html());
			console.log(tocItems);
		}

		itemsByLevel[listLevel].push(...tocItems); // check for <a> tag in case some landing pages have lists?
	});

	return itemsByLevel;
};

export const getHeaders = async ($) => {
	return $('div#__main-content').find('h2,h3,h4,h5').toArray().map((header) => {
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

	// TOM56, 4095 & 4031 have abnormal "children" structure
	if (!/TOM(?:56|4095|4031)/.test(tomName)) {
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
					.map((li) => {
						const a = $(li).children('a').get(0);
						const href = join(`${path}/..`, a.attribs.href.trim());
						const text = $(a).text();

						return { href, text };
					});
			} else {
				return getNormalChildren();
			}
		} else if (tomName === 'TOM4031') {
			const regex = /exami_4031\.5-[ef]\.html/;

			if (regex.test(fileName)) {
				return contentRef
					.find('div.span-6 a')
					.toArray()
					.map((a) => ({
						href: join(`${path}/..`, a.attribs.href.trim()),
						text: $(a).text(),
					}));
			} else {
				return getNormalChildren();
			}
		}
	}
};