// @flow
import { outputJSON, readJSON, stat } from 'fs-extra';
import { basename, join } from 'path';
import { batchAwait } from '../util';
import { updateCachedData } from './update-cache';
import { TOM_DATA_CACHE } from '../../constants';
import { landingPages } from './paths';
import { TOMDataType, FileData } from './types';

export default async function getTOMData(tomName): TOMDataType { // should rename this or extract parts because it mostly updates
	console.log('tomName:');
	console.log(tomName);
	const cacheFilePath = join(TOM_DATA_CACHE, `${tomName}.json`);

	try {
		return await verifyCache(cacheFilePath);
	} catch (e) {
		console.error('Error getting TOM data:');
		console.error(e);
	}
}

async function verifyCache(cacheFilePath: string) {
	console.log('Verifying cache');

	const tomData: TOMDataType = await readJSON(cacheFilePath);
	const { files } = tomData;
	const outdatedFiles: Array<FileData> = [];

	const fileObjects = Object.values(files);
	const getStatTasks = fileObjects.map((file) => stat(file.path));

	const fileStats = await Promise.all(getStatTasks);

	for (const [ i, fileStat ] of fileStats.entries()) {
		const lastModified = fileStat.mtime;
		const file = fileObjects[i];

		if (lastModified > file.lastUpdated) {
			console.log(`${basename(file.path)} is outdated`);
			console.log(file);
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

async function updateTOMData(outdatedFiles: Array<FileData>, tomData): Promise<void> {
	console.log('Updating TOM data');
	const files = tomData.files;
	const filesByDepth: Array<?Array<FileData>> = (
		outdatedFiles.reduce((acc, file) => {
			console.log(`${basename(file.path)} is outdated, updating.`);
			const { depth } = file;
			if (!acc[depth]) acc[depth] = [];
			acc[depth].push(file);

			return acc;
		}, [])
	);

	for (const depth: Array of filesByDepth) {
		if (!depth) continue;

		const updateTasks: Array<Promise<FileData>> = depth.map((file) => updateCachedData(file.path, tomData, landingPages));
		// test out different queue sizes, it might be fine doing huge amounts at once
		console.log('About to await batchAwait:');
		const updatedFiles: Array<FileData> = await batchAwait(updateTasks, 100);
		console.log('batchAwait awaited.');

		for (const file of updatedFiles) {
			files[file.path] = file; // make sure this actually mutates tomData
		}
	}
}
