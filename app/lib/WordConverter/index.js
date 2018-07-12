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

export default function WordConverter(html: string, opts?: optsType): any {
	const _html = cleanPreLists(html);

	const $ = cheerio.load(_html, { decodeEntities: false });
	const funcs = [
		boldFigureCaptions,
		handleComments,
		cleanLists,
		cleanPostLists,
		fixTables,
		cleanTOC,
		wetTransforms,
		removeEmptyPs,
	];
	funcs.forEach(func => func($, opts));

	// const $ = cheerio.load(html, { decodeEntities: false });
	return $;
}

function removeEmptyPs($) {
	$('p').filter((i, p) => /^\s*$/.test($(p).html()))
		.each((i, el) => $(el).remove());
}

function handleComments($) {
	// Get rid of comment anchors
	$('a').filter((i, el) => ($(el).attr('style') || '').includes('mso-comment-reference'))
		.each((i, el) => $(el).replaceWith($(el).contents()));

	// Get rid of comment divs
	$('div').filter((i, el) => ($(el).attr('style') || '').includes('mso-element:comment-list'))
		.each((i, el) => $(el).remove());
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
		if (toc.length) {
			const divWrapper = $('<div class="TOC"><ul></ul></div>');
			divWrapper.insertBefore(toc.get(0));
			toc.map((i, tocItem) => {
				if (tocItem.tagName === 'p') tocItem.tagName = 'li';
				// $('a', tocItem).attr('href', '#');
				return tocItem;
			}).appendTo(toc.first().prev('div.TOC').children().get(0));
		}
	}
	$('div.TOC').each((i, tocDiv) => {
		const ul = $('ul', tocDiv).get(0);
		nestTOCList($, ul);

		$('li.MsoToc2', tocDiv).each((i, el) => {
			const elRef = $(el);
			const href = `#_sec${i+1}`;
			addSecNumsToChildren(elRef, href, $);
		});
		$(ul).find('.MsoToc1, .MsoToc2, .MsoToc3, .MsoToc4, .MsoToc5').each((i, li) => $(li).attr('class', null));


	});
}

function addSecNumsToChildren(elRef, href, $) {
	const children = elRef.children();

	elRef.attr('class', null);
	children.filter('a').first().attr('href', href);

	if (children.length > 1) {
		children.filter('ul').first().children('li').each((i, el) => {
			const childHref = href + `_${i+1}`;
			addSecNumsToChildren($(el), childHref, $);
		});
	}
}

