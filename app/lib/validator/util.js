import { readFile, stat } from 'fs-extra';

// wraps main page content in a div, to be able to query it with cheerio
export const wrapContent = async (htmlString, filename) => {
	const contentRegexStart =
		'<!--\\sSearchable\\scontent\\sbegins\\s\\/\\sdebut\\sde\\sla\\srecherche\\sdu\\scontenu\\s-->';
	const contentRegexEnd =
		'<!--\\s(?:Searchable\\scontent\\s)?ends\\s\\/\\sfin\\sde\\sla\\srecherche\\sdu\\scontenu\\s-->';
	const contentRegexEndBackup = '<!-- InstanceEndEditable -->';

	const startRegexMatches = new RegExp(contentRegexStart).test(htmlString);
	const endRegexMatches = new RegExp(contentRegexEnd).test(htmlString);

	if (!startRegexMatches) console.error(`Start regex didn't match in ${filename}. Uh oh.`);
	if (!endRegexMatches) console.error(`End regex didn't match in ${filename}. Verify that it still worked.`);

	const endRegex = endRegexMatches ? contentRegexEnd : contentRegexEndBackup;

	const contentRegex = new RegExp(`(${contentRegexStart})([\\s\\S]+?)(${endRegex})`, 'i');

	const regexMatches = contentRegex.test(htmlString);

	if (regexMatches) {
		return htmlString.replace(contentRegex, '$1<div id="__main-content">$2</div>$3');
	} else {
		console.error('Content regex failed didn\'t match anything. (Likely that the content start comment is missing)');
		return null;
	}
};

export const getNavs = async ({ $ }) => {
	const navRef = $('.embedded-nav');

	if (navRef.length === 0) {
		return [];
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

	return navObjects;
};

export const getNav = async ($) => {
	const navRefs = $('.embedded-nav');

	if (navRefs.length === 0) {
		return null;
	}

	const navObject = {};

	const navRef = navRefs.first();
	const navItems = navRef.find('a');
	navItems.each((_i, navItem) => {
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
				console.error('An error occurred while parsing nav.');
				return;
		}
	});

	return Object.keys(navObject).length > 0
		? navObject
		: null;
};