import { clipboard } from 'electron';
import WordConverter from 'lib/word-converter';
import cleanup from 'lib/cleanup';
import { beautify } from 'lib/util';
import { fireAlert, setTextContent } from './home';
import { startAutoAcro } from './home/autoAcro';


export const setWordConvert = ($) =>
	(dispatch) => dispatch({ type: 'SET_WORDCONVERT', payload: beautify($) });

export default function convertWord() {
	const hasImg = ($) => !!$('img').length;
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
		const html = home.wordConvert.text;

		if (!!opts.autoAcro) {
			clipboard.writeText(html);
			dispatch(startAutoAcro(html)); //todo: decouple cleanup from autoAcro
		} else {
			const cleanHtml = cleanup(html, opts);
			clipboard.writeText(cleanHtml);
			dispatch(setTextContent(cleanHtml));
			dispatch(fireAlert());
		}
	};
}