import WordConverter from 'lib/WordConverter';
import cleanup from 'lib/cleanup';
import { clipboard } from 'electron';
import { fireAlert, setTextContent } from './home';
import { startAutoAcro } from './home/autoAcro';

const hasImg = ($) => !!$('img').length;

const setClipboard = (dispatch) => {
	const wordHTML = clipboard.readHTML('text/html') || clipboard.readText();
	dispatch({type: 'SET_CLIPBOARD', payload: wordHTML});
	return wordHTML;
};

export const setWordConvert = ($) =>
	(dispatch) => dispatch({ type: 'SET_WORDCONVERT', payload: beautify($) });

export default function convertWord() {
	return (dispatch, getState) => {
		const wordHTML = clipboard.readHTML('text/html') || clipboard.readText();
		const opts = getState().home.options;
		dispatch({ type: 'SET_CLIPBOARD', payload: wordHTML });

		try {
			const cheerioRef = WordConverter(wordHTML, opts);
			if (!hasImg(cheerioRef)) {
				dispatch(setWordConvert(cheerioRef));
				dispatch(postConvert());
			} else {
				const imageModal = $('#imageModal');

				dispatch(setWordConvert(cheerioRef));
				imageModal.modal('show');
			}
		} catch (e) {
			console.error('Error in Word conversion:\n' + e);
			dispatch(fireAlert('danger', e.message));
		}
	};
}

export function postConvert() {
	$('#imageModal').modal('hide');
	return (dispatch, getState) => {
		const { home } = getState();
		const opts = home.options;
		const html = home.wordConvert;

		if (!!opts.autoAcro) {
			clipboard.writeText(html);
			dispatch(startAutoAcro(html));
		} else {
			const cleanHtml = cleanup(html, opts);
			clipboard.writeText(cleanHtml);
			dispatch(setTextContent(cleanHtml));
			dispatch(fireAlert());
		}
	};
}

function beautify($) {
	const bodyRef = $('body');
	const text = bodyRef.html();
	const beautify = require('js-beautify').html;
	const config = {
		indent_size: 2,
		indent_char: '  ',
		indent_with_tabs: true,
		eol: '\r\n',
		unescape_strings: true,
		wrap_line_length: 0,
		extra_liners: 'h2',
		preserve_newlines: false,
	};

	return beautify(text, config);
}