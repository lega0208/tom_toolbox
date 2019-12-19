/**
 * Clean up HTML a bit before parsing lists
 */
export default function preListClean(html) {
	console.log('original html:');
	console.log(html);
	const funcs = [
		removeSupportComments,
		replaceImgSrcs,
		//logHtml,
		removeEmptyTags,
		addClassQuotes,
		removeListComments,
		removeTags,
		handleKbd,
		fixStrongSpaces,
		removeDeleted,
		removeImgJunk,
	];
	return funcs.reduce((acc, func) => func(acc), html);
}

function logHtml(html) {
	console.log(html);

	return html;
}

function removeSupportComments(html) {
	const regex = /<!(?:--)?\[if !support(?:NestedAnchors|Footnotes|Annotations)]>[\s\S]+?<!(?:--)?\[endif]>/gi;

	return html.replace(regex, '')
}

function replaceImgSrcs(html) {
	const regex = /(?:<!--\[if gte vml 1\]>[\s\S]+?)?<v:imagedata src="(.+?)"[\s\S]*?(?:<img[^>]+?><!(?:--)?\[endif\](?:--)?>|\/>)/gi;

	while (regex.test(html)) {
		html = html.replace(regex, '<img src="$1">');
	}
	return html;
}

function removeImgJunk(html) {
	const regex =
			      /<v:shapetype[\s\S]+?<\/v:shapetype>|<!(?:--)?\[if !vml\](?:--)?>[\s\S]+?<!(?:--)?\[endif\](?:--)?>|<\/v:shape><!(?:--)?\[endif\](?:--)?>/g;
	const regex2 = /<b[^>]+?>\s*(<img[^>]+?>)\s*<\/b>/g;

	while (regex.test(html)) {
		html = html.replace(regex, '').replace(regex2, '$1');
	}

	return html;
}

function removeListComments(html) {
	const msoListIgnore = /<!-{0,2}\[if !supportLists]-{0,2}>[\s\S]+?<!-{0,2}\[endif]-{0,2}>/g;

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
	// remove strong/b tags that are only bolding whitespace
	const boldWhitespaceRegex = /<(?:strong|b)(?:\s+[^>]+)?>(\s+)<\/(?:strong|b)>/;
	while (boldWhitespaceRegex.test(html)) {
		html = html.replace(boldWhitespaceRegex, '$1');
	}

	// remove actually empty tags
	const regex = /<(?!td|th|a )([\S]+?)[^>]*?>(\s*?)<\/\1>/;
	while (regex.test(html)) {
		if (regex.exec(html) && !regex.exec(html)[0].includes('mso-spacerun')) {
			html = html.replace(regex, '$2');
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
	const strongRegex = /<\/(strong|b)><\1>/;
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
		'ins',
	].reduce((acc, tag) => {
		const regex = new RegExp(`<${tag}[\\s\\S]*?>([\\s\\S]*?)</${tag}>`, 'g');
		while(regex.test(html)) {
			html = html.replace(regex, '$1')
		}
		return html;
	}, html);
}

function removeDeleted(html) {
	const regex = /<del[\s\S]+?<\/del>/g;

	return html.replace(regex, '');
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

	return html.replace(regex, '</$1> ')
						 .replace(regex2, '$1 <$2>');
}
