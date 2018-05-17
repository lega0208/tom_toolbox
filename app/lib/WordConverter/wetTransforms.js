
export default function wetTransforms($, { wetVersion }) {
	fixNotes($, wetVersion);
	addWETClasses($, wetVersion);
}

function fixNotes($, wetVersion) {
	$('div').has('.Note').each((i, div) => {
		if (wetVersion === 4) {
			const divRef = $(div);
			divRef.children('p').has('strong').each((i, p) => {
				const pRef = $(p);
				pRef.children('strong').each((i, strong) => {
					const strongRef = $(strong);
					const strongText = strongRef.text();
					if (/note|remarque/i.test(strongText)) {
						strong.tagName = 'h4';
						strongRef.insertBefore(p);
					}
				});
			});
			divRef.children('.Note').removeAttr('class');
			divRef.addClass('alert alert-info');
		} else if (wetVersion === 2) {
			const divRef = $(div);
			divRef.children('.Note').removeAttr('class');
			divRef.addClass('module-note');
			if (divRef.parent().get(0).tagName === 'body') {
				divRef.addClass('span-6');
				$('<div class="clear"/>').insertAfter(div);
			}
		} else {
			console.error('Wrong wetVersion somehow');
		}
	});
}

function addWETClasses($, wetVersion) {
	// add list classes
	const listClass = wetVersion === 4 ? 'mrgn-tp-sm' : 'margin-top-medium';
	const listPClass = wetVersion === 4 ? 'mrgn-lft-0' : 'indent-none';
	$('li').addClass(listClass);
	$('li > p').addClass(listPClass);

	if (wetVersion === 4) {
		// add ol classes
		$('li > ol').filter((i, el) => $(el).parentsUntil(':not(li, ol, ul)').length === 3).addClass('lst-lwr-alph');
		$('li li > ol').filter((i, el) => $(el).parentsUntil(':not(li, ol, ul)').length === 5).addClass('lst-lwr-rmn');

		// add table classes
		$('table').addClass('table table-bordered');
	}
}