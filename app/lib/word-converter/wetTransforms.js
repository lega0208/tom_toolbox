
export default function wetTransforms($, { wetVersion, lang }) {
	fixNotes($, wetVersion);
	tableOfContents($, wetVersion, lang);
	addWETClasses($, wetVersion);
}

function tableOfContents($, wetVersion, lang) {
	const title = (lang === 'en') ? 'Table of contents'
																: (lang === 'fr') ? 'Table des matières' : console.error('lang error?');
	const outerClass = (wetVersion === 4) ? 'panel panel-default'
																				: 'span-4 module-table-contents';
	const header = (wetVersion === 4) ? `<div class="panel-heading"><h3 class="panel-title">${title}</h3></div>`
																		: `<p>${title}</p>`;

	$('div.TOC').each((i, div) => {
		const divRef = $(div);
		divRef.removeClass('TOC');
		divRef.addClass(outerClass);
		const headerRef = $(header);
		headerRef.prependTo(div);
		if (wetVersion === 4) {
			const bodyDiv = $('<div class="panel-body"/>');
			bodyDiv.insertAfter(headerRef);
			divRef.children('ul').appendTo($('div.panel-body', div).get(0));
		}
	});
}

function fixNotes($, wetVersion) {
	$('div').has('.Note').each((i, div) => {
		const divRef = $(div);

		switch (wetVersion) {
			case 4:
				divRef.children('p').has('strong').each((i, p) => {
					const pRef = $(p);
					pRef.children('strong').each((i, strong) => {
						const strongRef = $(strong);
						if (/note|remarque/i.test(strongRef.text())) {
							strong.tagName = 'p';
							strongRef.text(strongRef.text().replace(/((?:note|remarque)(?: ?\d)?)\s*:/i, '$1'));
							strongRef.addClass('h3');
							strongRef.insertBefore(p);
						}
					});
					pRef.html(pRef.html().replace(/^\s*:\s*/, '').trim());
				});
				divRef.children('.Note').removeAttr('class');
				divRef.addClass('alert alert-info');
				break;

			case 2:
				divRef.children('.Note').removeAttr('class');
				divRef.addClass('module-note');

				if (divRef.parent().get(0).tagName === 'body') {
					divRef.addClass('span-6');
					$('<div class="clear"/>').insertAfter(div);
				}
				break;

			default: console.error('Wrong wetVersion?');
		}
	});
}

function addWETClasses($, wetVersion) {
	// add list classes
	const listClass = wetVersion === 4 ? 'mrgn-tp-md' : 'margin-top-medium';
	const listPClass = wetVersion === 4 ? 'mrgn-lft-0' : 'indent-none';
	// add spacing to <li>s, but not the ones in the TOC
	$('li').not('div.panel-body > ul li, div.module-table-contents > ul li').addClass(listClass);
	$('li > p').addClass(listPClass);

	if (wetVersion === 4) {
		// add ol classes
		$('li > ol').filter((i, el) => $(el).parentsUntil(':not(li, ol, ul)').length === 3)
			.addClass('lst-lwr-alph');
		$('li li > ol').filter((i, el) => $(el).parentsUntil(':not(li, ol, ul)').length === 5)
			.addClass('lst-lwr-rmn');

		// add table classes
		$('table').addClass('table table-bordered');
		$('th').addClass('text-center bg-primary');
	}
}
