import nestLists from './nestLists';

export default function cleanLists($) {
	convertPs($);
	wrapLists($);
	nestLists($);
}

function convertPs($) {
	// Lists from Word are all in the form of <p>s, so turn them into <li>s
	$('p').each((i, elem) => {
		const sel = $(elem);

		const elemClass = sel.attr('class') || '';
		if (elemClass.includes('MsoList') || elemClass.includes('Bullet')) {
			if (!sel.css('mso-list') || !sel.css('mso-list').includes('none')) {
				elem.tagName = 'li';
			}
		}
		// Get rid of useless <span>s
		$('span', elem).each((i, span) => {
			const ref = $(span);
			const content = ref.contents();
			ref.replaceWith(content);
		});
		// Get rid of weird linebreaks
		const removedLinebreaks = sel.html().replace(/\r?\n/g, ' ');
		sel.html(removedLinebreaks);
	});
}

function wrapLists($) {
	const listClasses = [
		'MsoList',
		'MsoList2',
		'MsoList3',
		'Bullet1',
		'Bullet2',
		'Bullet3',
	];
	const olObj = {
		selectorClass: 'MsoList',
		tag: 'ol',
		otherTypeClass: 'Bullet1',
	};
	const ulObj = {
		selectorClass: 'Bullet1',
		tag: 'ul',
		otherTypeClass: 'MsoList',
	};
	const wrapList = ({ selectorClass, tag, otherTypeClass }) => {
		const selector = `li.${selectorClass}`;
		$(selector).each((i, el) => {
			const elRef = $(el);
			if (elRef.parent().is(tag)) {
				return;
			}
			const nextNonListItem = elRef.nextAll().not((i, elem) => {
				if (/h\d/.test(elem.tagName)) return false;

				const elemRef = $(elem);
				const elClass = elemRef.attr('class');
				const classList = listClasses.filter(className => !(className === otherTypeClass));
				if ((/p|li/.test(elem.tagName))) {
					return classList.includes(elClass);
				} else if (elemRef.next()) {
					const nextSiblingClass = elemRef.next().attr('class');
					return classList.includes(nextSiblingClass);
				} else {
					console.error('neither things did a thing? (wrapList)');
				}
			}).first();

			console.log(nextNonListItem.length);

			const restOfList = elRef.nextUntil(nextNonListItem);
			$(`<${tag}/>`).insertBefore(el)
				.append(el)
				.append(restOfList);
		});
	};

	const listObjs = [ olObj, ulObj, ];
	listObjs.forEach(wrapList);
	// $('body').html(html);
}