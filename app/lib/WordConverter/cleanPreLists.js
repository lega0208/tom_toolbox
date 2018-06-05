/**
 * Clean up HTML a bit before parsing lists
 */
export default function preListClean(html) {
	const funcs = [
		removeEmptyTags,
		addClassQuotes,
		removeListComments,
		removeTags,
		handleKbd,
	];
	return funcs.reduce((acc, func) => func(acc), html);
}

function removeListComments(html) {
	const msoListIgnore = /<!\-{0,2}[if !supportLists\]-{0,2}>[\s\S]+?<!-{0,2}\[endif\]-{0,2}>/g;

	while(msoListIgnore.test(html)) {
		html = html.replace(msoListIgnore, '');
	}
	return html;
}

function addClassQuotes(html) {
	const classRE = /<p class=(MsoList\d?|Bullet\d?)/g;

	while(classRE.test(html)) {
		html = html.replace(classRE, '<p class="$1"')
	}
	return html;
}

function removeEmptyTags(html) {
	const regex = /<(?!td|th|a )([\S]+?)[^>]*?>\s*?<\/\1>/;
	while (regex.test(html)) {
		if (regex.exec(html) && !regex.exec(html)[0].includes('mso-spacerun')) {
			html = html.replace(regex, '');
		} else {
			html = html.replace(/<span[^>]+?>\s+?<\/span>/, ' ');
		}
	}
	return html;
}
function removeTags(html) {
	return [
		'font',
		'span',
		'o:p'
	].reduce((acc, tag) => {
		const regex = new RegExp(`<${tag}[\\s\\S]*?>([\\s\\S]*?)</${tag}>`, 'g');
		while(regex.test(html)) {
			html = html.replace(regex, '$1')
		}
		return html;
	}, html);
}

function handleKbd(html) {
	// const tags = [
	// 	'a',
	// 	'b',
	// 	'br', // self-closing!!**
	// 	'div',
	// 	'em',
	// 	'h\\d',
	// 	'i',
	// 	'kbd',
	// 	'li',
	// 	'span',
	// 	'strong',
	// 	'sup',
	// 	'table',
	// 	'td',
	// 	'th',
	// ];
	// const tagsRE = '(?:' + tags.join('|') + ')';

	// const regex = new RegExp(`<(?!\/?\\w+|${tagsRE}(?:\\s[^>]+?>|>| ?\/>))([^>]+?)>`, 'g'); // finds angle brackets
	const regex = new RegExp(`&lt;([^&>]+?)&gt;`);
	let count = 0;
	let _html = html;
	while (regex.test(_html) && count < 100) {
		count++;
		_html = _html.replace(regex, '<kbd>$1</kbd>');
	}
	return _html;
}