import { copy, pathExists, readdir, readFile } from 'fs-extra';
import { basename, dirname, join, resolve } from 'path';
import { call, take, put } from 'redux-saga/effects';
import { VALIDATOR, getTOMsSuccess, getTOMsError } from 'actions/validator';
import { TOM_DATA_CACHE, DB_PATH, DEFAULT_DB_PATH, DISTRIB_PATH } from '@constants';
import { getPathsCache } from 'database/cache';

export default function* watchGetTOMs() {
	while (true) {
		yield take(VALIDATOR.GET_TOMS.START);
		try {
			const toms = yield call(getToms);
			console.log(`Found ${toms.length} toms!`);

			//yield put(getTOMsSuccess(homepages)); // used to be homepages
			yield put(getTOMsSuccess(toms));
		} catch (e) {
			console.error(e);
			yield put(getTOMsError(e));
		}
	}
}

// todo: add: if shared-drive cache is newer than local cache lastModified
async function getToms() {
  const externalTomDataCache = join(DISTRIB_PATH, 'TOM_Data');
  const tomDataFilepaths = await readdir(externalTomDataCache);
  const tomDataCacheFilepaths = await readdir(TOM_DATA_CACHE);

	if (!(await pathExists(TOM_DATA_CACHE))) {
		await copyDataCache();
	} else if (tomDataCacheFilepaths.length === 0) {
		await copyDataCache();
	} else if (tomDataFilepaths.length !== tomDataCacheFilepaths.length) {
	  const uncachedTomFiles = tomDataFilepaths.filter(path => !tomDataCacheFilepaths.includes(path));
	  console.log('uncached tom files:');
	  console.log(uncachedTomFiles.join('\n'));

	  const copyTasks =
              uncachedTomFiles
                  .map(file => copy(resolve(externalTomDataCache, file), resolve(TOM_DATA_CACHE, file)));
	  await Promise.all(copyTasks);
  }

	const pathsCache = await getPathsCache();
	return await pathsCache.getTomNames();
}

async function copyDataCache() {
	const tomDataDir = dirname(
		(await pathExists(DB_PATH))
			&& (await readFile(DB_PATH, 'utf8'))
			|| DEFAULT_DB_PATH
	);

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
