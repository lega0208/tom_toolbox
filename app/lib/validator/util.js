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
	if (!endRegexMatches) console.error(`End regex didn't match in ${filename}. Verify if it worked.`);

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