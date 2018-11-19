// @flow
import { basename } from 'path';
import PageValidator from './Validator';
import { FileData, TOMData, TOMResults } from 'lib/validator/types';
import { ProgressTracker } from '../../sagas/validator/progress';

const validatePage =
	async (fileData, tomData, progress) => await new PageValidator(fileData, tomData, progress).performValidations();

export default async (files: Array<FileData>, tomData: TOMData, progress: ProgressTracker): TOMResults => {
	const validateFileTasks = files.map((file) => validatePage(file, tomData, progress));

	return (await Promise.all(validateFileTasks)).sort((a, b) => { // sort results by filename
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