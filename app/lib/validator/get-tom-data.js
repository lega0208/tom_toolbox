// @flow
import { outputJSON, readFile, readJSON, stat } from 'fs-extra';
import { basename, join } from 'path';
import { batchAwait } from '../util';
import { updateCachedData } from './update-cache';
import { TOM_DATA_CACHE } from '../../constants';
import { TOMDataType, FileData } from './types';
import { clearCache } from 'database/cache';

export default async function getTOMData(tomName): TOMDataType { // should rename this or extract parts because it mostly updates
	console.log('tomName:');
	console.log(tomName);
	const cacheFilePath = join(TOM_DATA_CACHE, `${tomName}.json`);

	try {
		return await verifyCache(cacheFilePath);
	} catch (e) {
		console.error('Error getting TOM data:');
		console.error(e);
		if (e.message.includes('no such file or directory')) {
			clearCache();
		}
	}
}

async function verifyCache(cacheFilePath: string) {
	console.log('Verifying cache');

	const tomData = await readJSON(cacheFilePath);

	const { files } = tomData;
	const outdatedFiles: Array<FileData> = [];

	const fileObjects = Object.values(files);
	const getStatTasks = fileObjects.map(async (file) => {
		try {
			return await stat(file.path)
		} catch (e) {
			console.error(e);
		}
	}); // handle invalid file paths better

	const fileStats = (await Promise.all(getStatTasks)).filter((file) => !!file);

	for (const [ i, fileStat ] of fileStats.entries()) {
		const lastModified = fileStat.mtime;
		const file = fileObjects[i];

		if (lastModified > file.lastUpdated) {
			console.log(`${basename(file.path)} is outdated`);
			outdatedFiles.push(file);
		}
	}

	if (outdatedFiles.length > 0) {
		console.log('about to update data');
		await updateTOMData(outdatedFiles, tomData); // mutates tomData.files directly

		console.log(`Updated ${outdatedFiles.length} outdated files in ${tomData.tomName}`);
		console.log('Saving to cache file.');
		await outputJSON(cacheFilePath, tomData); // maybe also update the remote cache?
	}

	return tomData;
}

async function updateTOMData(outdatedFiles: Array<FileData>, tomData): Promise<void> {
	console.log('Updating TOM data');
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

		for (const file of depth) {
			try {
				await updateCachedData(file.path, tomData);
			} catch (e) {
				console.error(`Error in ${basename(file.path)}`);
				throw e;
			}
		}
	}
}
