// @flow
import PageValidator, { validatePage } from './Validator';
import { FileData, TOMDataType, TOMResults } from 'lib/validator/types';
import { ProgressTracker } from '../../sagas/validator/progress';

export default async (files: Array<FileData>, tomData: TOMDataType, progress: ProgressTracker): TOMResults => {
	console.log('validating');

	const validationTasks = files.map((file) => validatePage(file, tomData, progress));

	return (await Promise.all(validationTasks))
		.filter((pageResult) => pageResult.results.length > 0)
		.sort((a, b) => a.path.localeCompare(b.path));
};