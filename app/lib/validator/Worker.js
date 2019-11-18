import { batchAwait } from 'lib/util';
import { validatePage } from 'lib/validator/Validator';

onmessage = (msg) => {
	if (msg.data.source === 'react-devtools-bridge'
		|| msg.data.source === 'react-devtools-detector'
		|| msg.data.source === '@devtools-page'
		|| msg.data.type === 'webpackOk')
		return;

	console.log('message received in Worker:');

	const [ files, tomData ] = msg.data;
	const queueSize = 60;
	const updateProgress = () => postMessage(queueSize);

	batchAwait(files, (file) => validatePage(file, tomData), queueSize, updateProgress)
		.then((results) => postMessage(results));
};
