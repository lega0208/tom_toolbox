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
	const regex = /<(?!td|th|a )([\S]+?)[^>]*?>\s*?<\/\1>/g;
	while (regex.test(html)) {
		html = html.replace(regex, '');
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
	const tags = [
		'a',
		'b',
		'br', // self-closing!!**
		'div',
		'em',
		'h\\d',
		'i',
		'kbd',
		'li',
		'span',
		'strong',
		'sup',
		'table',
		'td',
		'th',
	];
	const tagsRE = '(?:' + tags.join('|') + ')';

	const regex = new RegExp(`<(?!\/?${tagsRE}(?:\s[^>]+?>|>| ?\/>))([^>]+?)>`, 'g'); // this regex clearly does not work properly. *finds "/a" and "/kbd"
	let count = 0;
	while (regex.test(html) && count < 100) {
		count++;
		console.log(regex.exec(html)[1]);
		html = html.replace(regex, '<kbd>$1</kbd>');
	}
	return html;
}