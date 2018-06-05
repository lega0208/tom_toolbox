// @flow
import cheerio from 'cheerio';
import cleanPreLists from './cleanPreLists';
import cleanLists from './lists';
import cleanPostLists from './cleanPostLists';
import fixTables from './fixTables';
import wetTransforms from './wetTransforms';
import nestTOCList from './nestTOCLists';

type optsType = {
	listType: string,
	lang: string,
	wetVersion: number,
	autoAcro: boolean,
	specChars: boolean,
	supNbsp: boolean,
}

export default function WordConverter(html: string, opts?: optsType): string {
	const _html = cleanPreLists(html);

	const $ = cheerio.load(_html, { decodeEntities: false });
	const funcs = [
		boldFigureCaptions,
		cleanLists,
		cleanPostLists,
		fixTables,
		cleanTOC,
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

function cleanTOC($) {
	const tocLvl1 = $('p.MsoToc1');
	if (tocLvl1.length) {
		tocLvl1.each((i, el) => {
			const elRef = $(el);
			const siblings = tocLvl1.get(i+1)
				? elRef.nextUntil('p.MsoToc1')
				: elRef.nextAll('p.MsoToc2, p.MsoToc3, p.MsoToc4, p.MsoToc5');
			const divWrapper = $('<div class="TOC"><ul></ul></div>');
			divWrapper.insertBefore(el);
			elRef.add(siblings)
				.map((i, tocItem) => {
					if (tocItem.tagName === 'p') tocItem.tagName = 'li';
					$('a', tocItem).attr('href', '#');
					return tocItem;
			}).appendTo(elRef.prev('div.TOC').children().get(0));
		});
	} else {
		const toc = $('p.MsoToc2, p.MsoToc3, p.MsoToc4, p.MsoToc5');
		const divWrapper = $('<div class="TOC"><ul></ul></div>');
		divWrapper.insertBefore(toc.get(0));
		toc.map((i, tocItem) => {
			if (tocItem.tagName === 'p') tocItem.tagName = 'li';
			$('a', tocItem).attr('href', '#');
			return tocItem;
		}).appendTo(toc.first().prev('div.TOC').children().get(0));
	}
	$('div.TOC').each((i, tocDiv) => {
		const ul = $('ul', tocDiv).get(0);
		nestTOCList($, ul);
		$(ul).find('.MsoToc1, .MsoToc2, .MsoToc3, .MsoToc4, .MsoToc5').each((i, li) => $(li).attr('class', null))
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
