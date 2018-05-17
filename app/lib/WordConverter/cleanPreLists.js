/**
 * Clean up HTML a bit before parsing lists
 */
export default function preListClean($) {
	const funcs = [
		removeEmptyTags,
		addClassQuotes,
		removeListComments,
		removeTags,
	];
	const bodyRef = $('body');
	const html = bodyRef.html();
	const reducedHTML = funcs.reduce((acc, func) => func(acc), html);
	bodyRef.html(reducedHTML);

	boldFigureCaptions($);
}

function boldFigureCaptions($) {
	$('p.FigureCaption').each((i, caption) => {
		const captionRef = $(caption);
		if (captionRef.next().get(0).tagName === 'table') {
			captionRef.prependTo(captionRef.next());
			caption.tagName = 'caption';
		} else {
			captionRef.replaceWith(`<p><strong>${captionRef.contents()}</strong></p>`)
		}
	});
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