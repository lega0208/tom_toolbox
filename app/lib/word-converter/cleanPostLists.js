
const replaceWithContents = (cheerioObject) => cheerioObject.replaceWith(cheerioObject.contents());

export default function cleanPostLists($) {
	// Remove "WordSection"s
	$('div').filter((i, div) => ($(div).attr('class') || '').includes('WordSection'))
		.each((i, div) => replaceWithContents($(div)));

	// remove unnecessary attributes
	$('*').removeAttr('style')
	      .removeAttr('width')
				.removeAttr('height')
				.removeAttr('border')
				.removeAttr('cellpadding')
				.removeAttr('cellspacing')
				.removeAttr('align')
				.removeAttr('valign')
				.removeAttr('bgcolor')
				.removeAttr('nowrap')
				.removeAttr('paragraph')
				.removeAttr('paragraphcxspfirst')
				.removeAttr('paragraphcxspmiddle')
				.removeAttr('paragraphcxsplast')
		    .removeAttr('cxspfirst')
		    .removeAttr('cxspmiddle')
		    .removeAttr('cxsplast')
				.removeAttr('type')
				.removeAttr('start')
				.not('p.Note, p.MsoToc1, p.MsoToc2, p.MsoToc3, p.MsoToc4, p.MsoToc5, div.alert, div.module-note')
				.removeAttr('class');

	// change <b>s to <strong>s
	$('b').each((i, elem) => elem.tagName = 'strong');

	// change <i>s to <em>s
	$('i').each((i, elem) => elem.tagName = 'em');

	// remove <u> tags
	$('u').each((i, u) => replaceWithContents($(u)));

	// fix header ids
	const headers = $('h2').add('h3').add('h4').add('h5');
	headers.each((i, el) => {
		const elRef = $(el);
		let counter = 0;
		while (counter < 100 && elRef.children('span').length) {
			counter++;
			elRef.children('span').each((i, span) => replaceWithContents($(span)))
		}
		const anchor = elRef.children('a').each((i, a) => replaceWithContents($(a)));
		replaceWithContents(anchor);
		elRef.children('strong').each((i, strong) => replaceWithContents($(strong)))
	});

	// convert anchors to ids
	$('a').each((i, el) => {
		const elRef = $(el);
		if (elRef.attr('name')) {
			const id = elRef.attr('name');
			elRef.parent().attr('id', id);
			replaceWithContents(elRef);
		}
	});

}
