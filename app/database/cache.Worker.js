import db from './data-interface';

onmessage = (msg) => {
	if (msg.data.source === 'react-devtools-bridge'
		|| msg.data.source === 'react-devtools-detector'
		|| msg.data.source === '@devtools-page'
		|| msg.data.type === 'webpackOk')
		return;

	if (msg.data.query) {
		db.query(msg.data.query)
			.then(({ result }) => postMessage({ result }))
			.catch(error => postMessage({ error }));
	}
};
