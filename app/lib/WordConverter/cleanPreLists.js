/**
 * Clean up HTML a bit before parsing lists
 */
export default function preListClean(html) {
	const funcs = [
		replaceImgSrcs,
		removeEmptyTags,
		addClassQuotes,
		removeListComments,
		removeTags,
		handleKbd,
		fixStrongSpaces,
	];
	return funcs.reduce((acc, func) => func(acc), html);
}

function replaceImgSrcs(html) {
	const regex = /<!--\[if gte vml 1\]>[\s\S]+?<v:imagedata src="(.+?)"[\s\S]+?<img[^>]+?><!(?:--)?\[endif\](?:--)?>/gi;

	while (regex.test(html)) {
		html = html.replace(regex, '<img src="$1">');
	}
	return html;
}

function removeListComments(html) {
	const msoListIgnore = /<!\-{0,2}[if !supportLists\]-{0,2}>[\s\S]+?<!-{0,2}\[endif\]-{0,2}>/g;

	while (msoListIgnore.test(html)) {
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
	// Get rid of br tags
	const brRegex = /<br[^>]*?>/;
	while (brRegex.test(html)) {
		html = html.replace(brRegex, '');
	}

	// Get rid of strong tags that close and immediately open
	const strongRegex = /<\/strong><strong>/;
	while (strongRegex.test(html)) {
		html = html.replace(strongRegex, '');
	}

	return html;
}
function removeTags(html) {
	return [
		'font',
		'span',
		'o:p',
	].reduce((acc, tag) => {
		const regex = new RegExp(`<${tag}[\\s\\S]*?>([\\s\\S]*?)</${tag}>`, 'g');
		while(regex.test(html)) {
			html = html.replace(regex, '$1')
		}
		return html;
	}, html);
}

function handleKbd(html) {
	const regex = new RegExp(`&lt;(?:\\s|&nbsp;)?([^&>]+?)(?:\\s|&nbsp;)?&gt;`);

	while (regex.test(html)) {
		html = html.replace(regex, '<kbd>$1</kbd>');
	}

	return html;
}

function fixStrongSpaces(html) {
	const regex = /\s<\/(strong|b)>(?!\s)/g;
	const regex2 = /(\S)<(strong|b)>\s/g;
	console.log(html);
	console.log(regex.test(html));

	return html.replace(regex, '</$1> ')
						 .replace(regex2, '$1 <$2>');
}