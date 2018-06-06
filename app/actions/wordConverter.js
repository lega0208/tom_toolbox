import WordConverter from '../lib/WordConverter';
import cleanup from '../lib/cleanup';
import { clipboard } from 'electron';
import { fireAlert, setTextContent } from './home';
import { startAutoAcro } from './home/autoAcro';

export default function convertWord() {
	return (dispatch, getState) => {
		const wordHTML = clipboard.readHTML('text/html') || clipboard.readText();
		const opts = getState().home.options;
		dispatch({type: 'SET_CLIPBOARD', payload: wordHTML});

		try {
			const html = WordConverter(wordHTML, opts);

			if (opts.autoAcro === true) {
				clipboard.writeText(html);
				dispatch(startAutoAcro(html));
			} else {
				const cleanHtml = cleanup(html, opts);
				clipboard.writeText(cleanHtml);
				dispatch(setTextContent(cleanHtml));
				dispatch(fireAlert());
			}
		} catch (e) {
			console.error('Error in Word conversion:\n' + e);
			dispatch(fireAlert(e));
		}
	};
}