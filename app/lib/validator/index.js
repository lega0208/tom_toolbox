import { FileData, TOMDataType, TOMResults } from 'lib/validator/types';
import { ProgressTracker } from 'sagas/validator/progress';
import Worker from './Worker.js';
import { measureTime } from 'lib/util';

let worker;
const validateWithWorker = (files, tomData, progress) => new Promise((res, rej) => {
	try {
		if (!worker) worker = new Worker();

		worker.onmessage = (msg) => {
			if (typeof msg.data === 'number') {
				progress.addCompleted(msg.data);
			} else {
				res(msg.data);
			}
		};
		worker.postMessage([files, tomData]);
	} catch (e) {
		console.error(e);
		rej(e);
	}
});

export default async (files: Array<FileData>, tomData: TOMDataType, progress: ProgressTracker): TOMResults => {
	console.log('validating');
	//const validationTasks = files.map((file) => validatePage(file, tomData, progress));

	//const results = await batchAwait(files, (file) => validatePage(file, tomData, progress), 10);
	const getTime = measureTime();
	const results = await validateWithWorker(files, tomData, progress);
	const timeDiff = getTime();
	console.log(`Validation took ${timeDiff}`);
	//return (await Promise.all(validationTasks))
	return results
		.filter((pageResult) => pageResult.results.length > 0)
		.sort((a, b) => a.path.localeCompare(b.path));
};