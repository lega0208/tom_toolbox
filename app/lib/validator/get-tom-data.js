// @flow
import { outputJSON, readJSON, stat } from 'fs-extra';
import { batchAwait } from '../util';
import { updateCachedData } from './update-cache';
import { TOM_DATA_CACHE } from '../../constants';
import { landingPages } from './paths';
import { TOMData, FileData } from 'lib/validator/types';

export default async function getTOMData(tomName): Promise<TOMData> { // should rename this or extract parts because it mostly updates
	const cacheFilePath = join(TOM_DATA_CACHE, `${tomName}.json`);

	try {
		const tomData: TOMData = await verifyCache(cacheFilePath);
		// format data to use from state
		return formatTOMData(tomData);
	} catch (e) {
		console.error('Error getting TOM data:');
		console.error(e);
	}
}

async function verifyCache(cacheFilePath: string): Promise<TOMData> {
	const tomData: TOMData = await readJSON(cacheFilePath);
	const { files } = tomData;
	const outdatedFiles: Array<FileData> = [];

	for (const file of Object.values(files)) {
		const lastModified = (await stat(file.path)).mtime;

		if (lastModified > file.lastUpdated) {
			outdatedFiles.push(file);
		}
	}

	if (outdatedFiles.length > 0) {
		await updateTOMData(outdatedFiles, tomData); // mutates tomData.files directly

		console.log(`Updated ${outdatedFiles.length} outdated files in ${tomData.tomName}`);
		console.log('Saving to cache file.');
		await outputJSON(cacheFilePath, tomData); // maybe also update the remote cache?
	}

	return tomData;
}

async function updateTOMData(outdatedFiles: Array<FileData>, tomData: TOMData): Promise<void> {
	const { files } = tomData;
	const filesByDepth: Array<Array<FileData>> =
		outdatedFiles.reduce((acc, file) => {
			const { depth, path } = file;
			if (!acc[depth]) acc[depth] = [];
			acc[depth].push(path);

			return acc;
		}, []);

	for (const depth: Array of filesByDepth) {
		const updateTasks: Array<Promise<FileData>> = depth.map((path) => updateCachedData(path, tomData, landingPages));
		// test out different queue sizes, it might be fine doing huge amounts at once
		const updatedFiles: Array<FileData> = await batchAwait(updateTasks, 100);

		for (const file of updatedFiles) {
			files[file.path] = file; // make sure this actually mutates tomData
		}
	}
}

// changes fileData.children from an array of path strings to and object where key=filePath, val=ObjectRef
async function formatTOMData(tomData): void {
	const { files } = tomData;
	for (const filePath of Object.keys(files)) {
		let fileChildren = files[filePath].children;

		const childrenObj = {};
		for (const child of fileChildren) {
			childrenObj[child] = files[child.href];
		}
		fileChildren = childrenObj;
	}
}