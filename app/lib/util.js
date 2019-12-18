/**
 * Random utility functions
 */
/* Take an array of unresolved Promises and await them in batches */
export const batchAwait = async (arr, mapFunc, queueSize = 10, postBatchFunc = () => {}) => {
	try {
		const returnVals = [];
		while (arr.length > 0) {
			const queue = arr.splice(0, queueSize);
			const awaitedQueue = await Promise.all(queue.map(mapFunc));
			returnVals.push(...awaitedQueue);
			console.log('batch completed');
			postBatchFunc();
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

function formatHtml(html) {
	const lines = html.split('\r\n');
	const getPrevLine = (i) => lines[i - 1] || null;
	const getPrevPrevLine = (i) => lines[i - 2] || null;
	const getNextLine = (i) => lines[i + 1] || null;
	const isHeader = (line = '') => /^\s*<h\d>/.test(line);
	const isBlankLine = (line = '') => /^\s*$/.test(line);
	const removePrevLine = (i) => lines[i - 1] = '{removed}';

	for (const [ i, line ] of lines.entries()) {
		const prevLine = getPrevLine(i);
		const prevPrevLine = getPrevPrevLine(i);
		const nextLine = getNextLine(i);

		// remove lines if multiple headers
		if (isHeader(line)
			&& prevLine !== null
			&& prevPrevLine !== null
			&& isBlankLine(getPrevLine(i))
			&& isHeader(getPrevPrevLine(i))
		) {
			removePrevLine(i);
		}

		// add line before p>strong
		if (/^<p[^>]*?><strong>.+<\/strong><\/p>/.test(line) && prevLine !== null && !isBlankLine(prevLine)) {
			lines[i] = '\r\n' + line;
		}

		// line after top-level list
		if (/^<\/[uo]l>$/.test(line) && getNextLine(i) !== null) {
			lines[i] += '\r\n';
		}

		const clearfixRE = /^<div class="clearfix/;
		// line after img (if not clearfix)
		if (/^<img/.test(line) && nextLine !== null && !clearfixRE.test(nextLine)) {
			lines[i] += '\r\n';
		}

		// line after clearfix
		if (clearfixRE.test(line) && nextLine !== null) {
			lines[i] += '\r\n';
		}
	}

	return lines.filter((line) => !/^{removed}$/.test(line)).join('\r\n');
}

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

	return formatHtml(
		beautify(html, config)
			.replace(/(\s*)(<(?!td)[^>]+?>)(<img[^>]+?>)(<\/(?!td)[^>]+?>)/g, '$1$2$1\t$3$1$4')
			.replace(/\r?\n(\t+?<h\d class="panel-title")/g, '$1')
			.replace(/(?<=<div class="alert alert-info">\r?\n)\r?\n(\s+<h\d>)/g, '$1')
			.replace(/(?<=<\/h\d>\r?\n)\r?\n(<h\d)/g, '$1') // this may be error prone
			.replace(/^(\s*)(<(?!img).+>)\s*(<img[^>]+>\s*)$/mg, '$1$2\r\n$1$3')
	);
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'); // $& means the whole matched string
}

export function findAndReplace(text, acroMap) {
	const reduceFunc = (replacedText, [acro, def]) => {
		const escapedAcro = escapeRegExp(acro);
		const regex = new RegExp(`([\\s>\\W])${escapedAcro}(?!<\/abbr>|\\p{Uppercase_Letter})`, 'gu'); // todo: optimize regex with lookbehind
		const firstLastRegex = new RegExp(`^${escapedAcro}(?!\\p{Uppercase_Letter})|(?<!\\p{Uppercase_Letter})${escapedAcro}$`, 'gum');   // Also probably only have one find/replace function
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

export function measureTime() {
	const start = process.hrtime();
	return () => {
		const end = process.hrtime(start);
		return `${Math.round((end[0] * 1e3 + end[1] / 1e6) / 10) / 100}s`
	}
}
