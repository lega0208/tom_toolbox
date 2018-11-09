import { pathExists, readdir, readJSON, readFile, outputJSON } from 'fs-extra';
import { join } from 'path';
import { call, take, put } from 'redux-saga/effects';
import { VALIDATOR, getTOMsSuccess, getTOMsError } from 'actions/validator';
import { TOM_DATA_CACHE, DB_PATH, DEFAULT_DB_PATH } from '@constants';

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
	if (!(await pathExists(TOM_DATA_CACHE))) {
		await copyDataCache(TOM_DATA_CACHE);
	}

	const toms = await readdir(TOM_DATA_CACHE);

	return toms.map((tom) => tom.replace('.json', ''));
}

async function copyDataCache(outputDir) {
	const tomDataDir = (await readFile(DB_PATH, 'utf8')) | DEFAULT_DB_PATH;
	const tomDataPath = join(tomDataDir, 'TOM_DATA.json');

	if (!(await pathExists(tomDataPath))) { // todo: remove for production
		await doFullParse();
	}
	try {
		const tomData = await readJSON(tomDataPath); // Object where each key is going to be a new JSON file

		const outputTasks =
			Object.entries(tomData)
				.map(([ tomName, data ]) => outputJSON(join(outputDir, `${tomName}.json`), data));

		return await Promise.all(outputTasks); // output "concurrently"
	} catch (e) {
		console.error('Error copying data cache.');
		throw e;
	}
}

async function doFullParse() {
	// populate the initial cache, extract to a script later maybe
	// make sure to console.log so that progress is visible
}