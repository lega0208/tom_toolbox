
function findNonStandard(string) {
  // ToDo: add reading from json file or db if they exist
  const nonStandardAcros = [
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

  return nonStandardAcros
		.map(acro => { // replace all backslashes
			const regex = new RegExp(acro);

			if (regex.test(string)) {
				let replacedAcro = acro + '';
				let replaceRegex = /\\\./g;
				while ((replaceRegex.test(replacedAcro))) {
					replacedAcro = replacedAcro.replace(replaceRegex, '.');
					console.log(replacedAcro)
				}
				return replacedAcro;
			} else {
				return null;
			}
		})
		.filter(i => i !== null); // filter empty indexes
}

export default async function findAcros(string) {
  const regex = /[\s>\W]([\p{Uppercase_Letter}.-]{2,9})(?!\s*?<\/abbr>)[:?!<), .\r\n]/gu;
  const startEndRegex = /^([\p{Uppercase_Letter}.-]{2,9})(?!\s*?<\/abbr>)[:?!<), .\r\n]|[:?!>), .\r\n]([\p{Uppercase_Letter}.-]{2,9}$)/gum;

  const results = [
  	...findAll(string, regex, true),
		...findAll(string, startEndRegex)
	];

  return [...removeDups(results), ...findNonStandard(string)];
}

const findAll = (string, regex, checkParen) => {
	const results = [];
	let result;

	while ((result = regex.exec(string)) !== null) {
		const match = result[0];
		const acro = result[1] || result[2];
		if (checkParen === true) {
			const regex = new RegExp(`\\(${acro}\\)`);
			if (!regex.test(match)) { // if acro is not parenthesized
				results.push(acro);
			}
		} else {
			results.push(acro);
		}
	}
	return results;
};

function removeDups(arr) {
  let i,
    len = arr.length,
    out = [],
    obj = {};
  for (i = 0; i < len; i++) {
    obj[arr[i]] = 0;
  }
  for (const el in obj) {
    out.push(el);
  }
  return out;
}
