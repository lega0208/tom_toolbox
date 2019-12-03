import { validatePage } from 'lib/validator/Validator';

async function validateWithProgress(data, postMessage) {
	const [ files, tomData ] = data;
	let completed = 0;
	const results = [];
	const tasks = [];

	const chunkSize = Math.floor(files.length / 10) || 1;

	for (const file of files) {
		try {
			tasks.push(validatePage(file, tomData));

			while (tasks.length > 0) {
				const completedTasks = await Promise.all(tasks.splice(0, chunkSize));

				results.push(...completedTasks);
				completed += completedTasks.length;
				postMessage(completed);
			}

		} catch (e) {
			console.error(`Error validating ${file.path} in Worker`);
			console.error(e);
		}
	}

	return postMessage(results);
}

onmessage = (msg) => {
	if (msg.data.source === 'react-devtools-bridge'
		|| msg.data.source === 'react-devtools-detector'
		|| msg.data.source === '@devtools-page'
		|| msg.data.type === 'webpackOk')
		return;

	console.log('message received in Worker:');

	validateWithProgress(msg.data, postMessage).then(() => console.log('validation donezo'));
};
