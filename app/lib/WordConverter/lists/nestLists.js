/**
 * Nest lists properly
 */

const getLevel = (elRef) => {
	const className = elRef.attr('class');
	switch (className) {
		case 'MsoList': return 1;
		case 'Bullet1': return 1;
		case 'MsoList2': return 2;
		case 'Bullet2': return 2;
		case 'MsoList3': return 3;
		case 'Bullet3': return 3;
		default: return 0; // non-li
	}
};
const getType = (elRef, className = elRef.attr('class')) =>
	className.includes('MsoList')
		? 'ol'
		: className.includes('Bullet')
			? 'ul'
			: 'error';
const getLvlLiClass = (el, level) => {
	const className = (el.tagName === 'ol') ? 'MsoList' : 'Bullet';
	return (className === 'MsoList' && level === 1)
		? className
		: className + level
};

export default function recurseLists($, ctx = 'body', level = 1) {
	$('ol', ctx).add('ul', ctx).each((i, parent) => {
		const lvlLiselector = 'li.' + getLvlLiClass(parent, level);
		const lvlLis = $(lvlLiselector, parent);
		lvlLis.each((i, li) => {
			const liRef = $(li);
			const currentLvl = getLevel(liRef);
			const nextSameLvlLi = lvlLis.get(i+1);

			const nextSiblings = nextSameLvlLi ? liRef.nextUntil(nextSameLvlLi) : liRef.nextAll();
			nextSiblings.each((i, nextSibling) => {
				const nextSibRef = $(nextSibling);
				const nextLvl = getLevel(nextSibRef);
				if (nextLvl > currentLvl) {
					const tagType = getType(nextSibRef);
					const liLastChild = liRef.children().last();
					if (!liLastChild.get() || !liLastChild.is(tagType)) {
						$(`<${tagType}></${tagType}>`).appendTo(li);
					}
					nextSibRef.appendTo(liRef.children().last());
				}
				if (nextLvl === currentLvl) {
					if (nextSibling.tagName !== 'li') {
						nextSibRef.appendTo(li);
					} else {
						console.log('Same level but is li? what.');
					}
				}

				// lower lvl means probably a div/img/whatever, so just append to last li (or its last child)
				if (nextLvl < currentLvl) {
					if (liRef.children().length && /[ou]l/.test(liRef.children().get(-1).tagName)) { // if li has a nested list
						nextSibRef.appendTo(liRef.children().last());
					} else {
						nextSibRef.appendTo(li);
					}
				}
			});
			if (level < 3) {
				recurseLists($, li, level + 1);
			}
		});
	});
}