// @flow
/**
 * Search for potential acronyms in the given string
 * and return the array of results
 **************************************************/
const findAll = (string: string): Array<string> => {
	const results: [] = [];
	const regex: RegExp =
		/(?<=^|[^\p{Uppercase_Letter}])([\p{Uppercase_Letter}-]{2,9})(?!\s*?<\/(?:abbr|kbd)>)(?=[^\p{Uppercase_Letter}]|$)/gum;

	let result: ?[];

	while (!!(result = regex.exec(string))) {
		const match: string = result[0];
		const acro: string  = result[1];

		// check for parentheses
		const parenRegex: RegExp = new RegExp(`\\(${acro}\\)`);

		if (!parenRegex.test(match))
			results.push(acro);
		else
			console.log(`${acro} is parenthesized`);
	}

	return removeDups(results);
};

function findNonStandard(string: string): Array<string> {
  // ToDo: add reading from json file or db if they exist
  const nonStandardAcros: Array<string> = [
    'c\\.àd\\.',
    'c\\.-à-d\\.',
    'Cab Au prog',
    'Cab Oth Prog',
    'Code DR',
    'comgen',
    'Dec\\.',
    'e\\.g\\.',
    'eBCI',
    'etc\\.',
    'Feb\\.',
    'Féd\\.',
    'Fév\\.',
    'GoC',
		'i\\.e',
		'i\\.e\\.',
    'p\\. ex\\.',
    'p\\.ex\\.',
    'Tel\\.',
  ];

  return nonStandardAcros.map(acro => { // replace all backslashes
			const regex: RegExp = new RegExp(`${acro}(?!\\s*?</abbr>)`);

			if (regex.test(string)) {
				let replacedAcro: string = acro + '';
				let replaceRegex: RegExp = /\\\./g;
				while ((replaceRegex.test(replacedAcro))) {
					replacedAcro = replacedAcro.replace(replaceRegex, '.');
				}
				return replacedAcro;
			} else {
				return null;
			}
		})
		.filter(i => !!i); // filter empty indexes
}

export default (string: string): Array<string> => findAll(string).concat(findNonStandard(string));

// removes duplicate array entries
function removeDups(arr: Array<string>): Array<string> {
  let i: number,
    len: number = arr.length,
    out: Array<string> = [],
    obj: {} = {};
  for (i = 0; i < len; i++) {
    obj[arr[i]] = 0;
  }
  for (const el in obj) {
    out.push(el);
  }
  return out;
}
