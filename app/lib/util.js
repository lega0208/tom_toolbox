/**
 * Random utility functions
 */
/* Take an array of unresolved Promises and await them in batches */
export const batchAwait = async (arr, queueSize = 10) => {
	try {
		const returnVals = [];
		while (arr.length > 0) {
			const queue = arr.splice(0, queueSize);
			const awaitedQueue = await Promise.all(queue);
			returnVals.push(...awaitedQueue);
		}

		return returnVals;
	} catch (e) {
		throw e;
	}
};

export const waitForEach = (processFunc, [head, ...tail]) =>
	!head
		? Promise.resolve()
		: processFunc(head).then(() => waitForEach(processFunc, tail));

export function beautify(html) {
	const beautify = require('js-beautify').html;
	const config = {
		indent_size: 2,
		indent_char: '  ',
		indent_with_tabs: true,
		eol: '\r\n',
		unescape_strings: true,
		wrap_line_length: 0,
		extra_liners: 'h1,h2,h3,h4',
		preserve_newlines: false,
	};

	return beautify(html, config).replace(/\s*(<img.+?>)/g, '\r\n$1');
}

export function findAndReplace(text, acroMap) {
	const reduceFunc = (replacedText, [acro, def]) => {
		const regex = new RegExp(`([\\s>\\W])${acro}(?!<\/abbr>|[A-Z])`, 'g'); // todo: optimize regex with lookbehind
		const firstLastRegex = new RegExp(`^${acro}|${acro}$`, 'gm');   // Also probably only have one find/replace function
		const parenRegex = new RegExp(`\\(${def}\\)`, 'g');

		if (!regex.test(text)) {
			replacedText = replacedText.replace(firstLastRegex, def);
		} else {
			replacedText = replacedText.replace(regex, `$1${def}`);
		}
		if (parenRegex.test(replacedText)) {
			replacedText = replacedText.replace(parenRegex, `(${acro})`);
		}
		return replacedText;
	};

	return Object.entries(acroMap).reduce(reduceFunc, text);
}

export function wrapWithAbbr(noDefsMap){
	return Object.entries(noDefsMap).reduce((wrappedMap, [k, v]) => {
		wrappedMap[k] = `<abbr title="${v}">${k}</abbr>`;
		return wrappedMap;
	}, {});
}

export function timeFunction(func) {
	return function() {
		const start = process.hrtime();
		const returnVal = func();
		const end = process.hrtime(start);

		console.log(`Execution time: ${end[0]}s ${end[1] / 1000000}ms`);
		return returnVal;
	}
}