
export default function cleanPostLists($) {
	const allRef = $('*');

	// remove unnecessary attributes
	allRef.removeAttr('style')
		.removeAttr('width')
		.removeAttr('border')
		.removeAttr('cellpadding')
		.removeAttr('cellspacing')
		.removeAttr('align')
		.removeAttr('valign')
		.removeAttr('bgcolor')
		.not('p.Note').removeAttr('class');

	// change <b>s to <strong>s
	$('b').each((i, elem) => {
		elem.tagName = 'strong';
	});

	// change <i>s to <em>s
	$('i').each((i, elem) => {
		elem.tagName = 'em';
	});

	// fix header ids
	const headers = $('h2').add('h3').add('h4').add('h5');
	headers.each((i, el) => {
		const elRef = $(el);
		let counter = 0;
		while (counter < 100 && elRef.children('span').length) {
			counter++;
			elRef.children('span').each((i, span) => $(span).replaceWith($(span).contents()))
		}
		const anchor = elRef.children('a').each((i, a) => $(a).replaceWith($(a).contents()));
		anchor.replaceWith(anchor.contents());
	});

	// convert anchors to ids
	$('a').each((i, el) => {
		const elRef = $(el);
		if (elRef.attr('name')) {
			const id = elRef.attr('name');
			const contents = elRef.contents();
			elRef.parent().attr('id', id);
			elRef.replaceWith(contents);
		}
	});
}