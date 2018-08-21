
export default function nestList($, list) {
	const className = $(list).children().get(0).attribs.class;
	const topLevelLis = $(`li.${className}`, list);
	topLevelLis.each((i, li) => recursiveNest($, li));
}

function recursiveNest($, ctx) {
	const liRef = $(ctx);
	const className = ctx.attribs.class;
	const siblings = liRef.nextUntil(`li.${className}`);
	if (siblings.length) {
		$('<ul/>').appendTo(ctx);
		$('ul', ctx).first().append(siblings);
		recursiveNest($, siblings.get(0));
	} else if (liRef.next().get(0)) {
		recursiveNest($, liRef.next().get(0));
	}
}

function getLevel(li) {
	const className = li.attribs.class;
	return Number(className[className.length-1]);
}