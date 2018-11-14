import { copy, pathExists, readdir, readJSON, readFile, outputJSON } from 'fs-extra';
import { basename, join, resolve } from 'path';
import { call, take, put } from 'redux-saga/effects';
import { VALIDATOR, getTOMsSuccess, getTOMsError } from 'actions/validator';
import { TOM_DATA_CACHE, DB_PATH, DEFAULT_DB_PATH } from '@constants';
import { homepages } from 'lib/validator/paths';

export default function* watchGetTOMs() {
	while (true) {
		yield take(VALIDATOR.GET_TOMS.START);
		try {
			const toms = yield call(getToms);
			console.log(`Found ${toms.length} toms!`);
			console.log(toms);

			//yield put(getTOMsSuccess(homepages)); // used to be homepages
			yield put(getTOMsSuccess(toms));
		} catch (e) {
			console.error(e);
			yield put(getTOMsError(e));
		}
	}
}

// check cache folder -> if empty, copy from db folder
// return list of fileNames with .json removed
async function getToms() {
	if (!(await pathExists(TOM_DATA_CACHE)) || (await readdir(TOM_DATA_CACHE)).length === 0) {
		await copyDataCache();
	}

	return Object.keys(homepages);
}

async function copyDataCache() {
	const tomDataDir =
		(await pathExists(DB_PATH))
			? (await readFile(DB_PATH, 'utf8'))
			: DEFAULT_DB_PATH;
	const tomDataPath = join(tomDataDir, 'TOM_Data');

	if (!(await pathExists(tomDataPath))) { // todo: remove for production
		console.error('TOM data cache doesn\'t exist?');
	}

	try {
		const cacheFiles = await readdir(tomDataPath);

		const copyTasks =
			cacheFiles.map((file) => copy(resolve(tomDataPath, file), resolve(TOM_DATA_CACHE, file)));

		return await Promise.all(copyTasks);
	} catch (e) {
		console.error(e);
		throw e;
	}
}
