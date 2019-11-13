import { getPaths } from './paths-interface';

onmessage = (msg) => {
	if (msg.data.source === 'react-devtools-bridge'
		|| msg.data.source === 'react-devtools-detector'
		|| msg.data.source === '@devtools-page'
		|| msg.data.type === 'webpackOk')
		return;

	if (msg.data.getPaths) {
		getPaths()
			.then(paths => postMessage({ result: paths }))
			.catch(error => postMessage({ error }));
	}
};
