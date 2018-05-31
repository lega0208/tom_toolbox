// @flow
import cheerio from 'cheerio';
import cleanPreLists from './cleanPreLists';
import cleanLists from './lists';
import cleanPostLists from './cleanPostLists';
import fixTables from './fixTables';
import wetTransforms from './wetTransforms';

export default function WordConverter(html: string, opts?: Object): string {
	const _html = cleanPreLists(html);

	const $ = cheerio.load(_html, { decodeEntities: false });
	const funcs = [
		boldFigureCaptions,
		cleanLists,
		cleanPostLists,
		fixTables,
		wetTransforms,
	];
	funcs.forEach(func => func($, opts));
	return beautify($);
}

function boldFigureCaptions($) {
	$('p.FigureCaption').each((i, caption) => {
		const captionRef = $(caption);
		if (captionRef.next().get(0).tagName === 'table') {
			captionRef.prependTo(captionRef.next());
			caption.tagName = 'caption';
		} else {
			captionRef.replaceWith(`<p><strong>${captionRef.contents()}</strong></p>`)
		}
	});
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
