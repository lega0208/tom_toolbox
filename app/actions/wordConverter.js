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

		let html = WordConverter(wordHTML, opts);

		if (opts.autoAcro === true) {
			clipboard.writeText(html);
			dispatch(startAutoAcro(html));
		} else {
			html = cleanup(html, opts);
			clipboard.writeText(html);
			dispatch(setTextContent(html));
			dispatch(fireAlert());
		}
	};
}