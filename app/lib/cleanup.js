/**
 * Cleanup scripts. Replaces special characters with their html entities,
 * replaces quotes with straight quotes, adds nbsp; and sup tags where appropriate
 */
const specChars = [
	['–', '&ndash;'],
	['\\s&\\s', ' &amp; '],
	['Á', '&Aacute;'],
	['À', '&Agrave;'],
	['Â', '&Acirc;'],
	['Ä', '&Auml;'],
	['Ã', '&Atilde;'],
	['Å', '&Aring;'],
	['Ç', '&Ccedil;'],
	['É', '&Eacute;'],
	['È', '&Egrave;'],
	['Ê', '&Ecirc;'],
	['Ë', '&Euml;'],
	['Î', '&Icirc;'],
	['Ó', '&Oacute;'],
	['Ò', '&Ograve;'],
	['Ô', '&Ocirc;'],
	['Ö', '&Ouml;'],
	['Õ', '&Otilde;'],
	['÷', '&divide;'],
	['×', '&times;'],
	['…', '&hellip;'],
	['Œ', '&OElig;'],
	['œ', '&oelig;'],
	['⅓', '<abbr title=\"one third\"><sup>1</sup>&frasl;<sub>3</sub></abbr>'],
	['’', '\''],
	['“|”', '"'],
];
const superscript = [
	['(\\d)e ', '$1<sup>e</sup> '],
	['1er', '1<sup>er</sup>'],
	['(\\d)ième', '$1<sup>ième</sup>'],
];
const nbsp = [
	['([^;])\\s*»', '$1&nbsp;»'],
	['«\\s*([^&])', '«&nbsp;$1'],
	['(\\d)\s\\$', '$1&nbsp;$'],
	['(\\d)\s(\\d)', '$1&nbsp;$2'],
];

function replaceAll(string, arr) {
	for (const [ findVal, replaceVal ] of arr) {
		const regex = new RegExp(findVal);

		while (regex.test(string)) {
			string = string.replace(regex, replaceVal);
		}
	}
	return string;
}

export const replaceSpecChars = (string) => replaceAll(string, specChars);
export const replaceSupNbsp = (string) => replaceAll(string, [...superscript, ...nbsp]);