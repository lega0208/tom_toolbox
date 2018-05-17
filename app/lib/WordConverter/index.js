// @flow
import cheerio from 'cheerio';
import cleanPreLists from './cleanPreLists';
import cleanLists from './lists';
import cleanPostLists from './cleanPostLists';
import fixTables from './fixTables';
import wetTransforms from './wetTransforms';

export default function WordConverter(html: string, opts?: Object): string {
	const $ = cheerio.load(html, { decodeEntities: false });
	const funcs = [
		cleanPreLists,
		cleanLists,
		cleanPostLists,
		fixTables,
		wetTransforms,
	];
	funcs.forEach(func => func($, opts));
	return beautify($);
}

function beautify($) {
	const bodyRef = $('body');
	const text = bodyRef.html();
	const beautify = require('js-beautify').html;
	const config = {
		indent_size: 2,
		indent_char: '  ',
		indent_with_tabs: true,
		eol: '\r\n',
		unescape_strings: true,
		wrap_line_length: 0,
		extra_liners: 'h2',
		preserve_newlines: false,
	};

	return beautify(text, config);
}
