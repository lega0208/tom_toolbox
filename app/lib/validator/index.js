// @flow
import { basename } from 'path';
import PageValidator, { validatePage } from './Validator';
import { FileData, TOMDataType, TOMResults } from 'lib/validator/types';
import { ProgressTracker } from '../../sagas/validator/progress';

//const validatePage =
//	async (fileData, tomData, progress) => await (new PageValidator(fileData, tomData, progress).performValidations());

export default async (files: Array<FileData>, tomData: TOMDataType, progress: ProgressTracker): TOMResults => {
	console.log('validating');
	const results = [];

	for (const file of files) {
		const pageResults = await validatePage(file, tomData, progress);

		if (pageResults.results.length > 0) {
			results.push(pageResults);
		}
		break;
	}
	console.log('done validating, returning results');
	//const validateFileTasks = files.map((file) => validatePage(file, tomData, progress));

	//return (await Promise.all(validateFileTasks))
	return results
		.sort((a, b) => { // sort results by filename
			const aFilename = basename(a.path);
			const bFilename = basename(b.path);

			if (aFilename > bFilename) {
				return -1;
			}
			if (aFilename < bFilename) {
				return 1;
			}

			return 0;
		});
};