import moment from 'moment';
import { ensureFile, readFile, outputFile } from 'fs-extra';
import db from './data-interface';
import cache from './cache';
// import { getAcrosModel } from './models.js';
import { LAST_CACHE } from '../constants';

export default async function checkCache(forceCache: ?boolean): void {
	const dbCache = cache();
	const lastCache = await readLastCache() || '';
	if (!lastCache || forceCache) {
		console.log('No lastCache, caching data');
		await cacheData(dbCache);
	} else if (await shouldUpdateCache(lastCache)) {
		await cacheData(dbCache, lastCache);
	} else {
		console.log('Data not cached');
	}
	await dbCache.close();
}

async function cacheData(dbCache, lastCache) {
	// const acros = await getAcrosModel(dbCache);
	try {
		const data = lastCache ? await getUpdatedData(lastCache) : await getUpdatedData();
		console.log(`Results found: ${data.length}`);
		await dbCache.insertAll(data);
		await writeLastCache();
	} catch (e) {
		console.error(`Error caching data:\n${e}`);
	}
}

async function writeLastCache() {
	try {
		await outputFile(LAST_CACHE, moment().toISOString(), 'utf-8');
	} catch (e) {
		console.error(`Error writing .lastCache:\n${e}`);
	}
}
async function readLastCache() {
	try {
		await ensureFile(LAST_CACHE);
		return await readFile(LAST_CACHE, 'utf-8');
	} catch (e) {
		console.error(`Error reading .lastCache:\n${e}`);
	}
}

async function getUpdatedData(lastCache) {
	if (lastCache) {
		const _lastCache = moment(lastCache).format('YYYY-MM-DD');
		const query =
			`SELECT [Acronym], [Definition], [Language] FROM Acronyms WHERE [Date Modified] > DateValue('${_lastCache}')`;
		return db.query(query);
	}
	try {
		const query = 'SELECT [Acronym], [Definition], [Language] FROM Acronyms';
		return db.query(query);
	} catch (e) {
		console.error(`Error getting updated data:\n${e}`);
	}
}

async function shouldUpdateCache(lastCache = '1970-01-01') {
	if (moment().isSame(lastCache, 'day')) {
		console.log('Already cached data today.');
		return false;
	}
	try {
		const query = 'SELECT MAX ([Date Modified]) FROM Acronyms';
		const result = (await db.query(query))[0].Expr1000;

		const lastUpdate = moment(result);
		console.log(`Last update: ${lastUpdate.format('YYYY-MM-DD')}`);
		const _lastCache = moment(lastCache);
		console.log(`Last cache: ${_lastCache.format('YYYY-MM-DD')}`);

		return lastUpdate.isAfter(_lastCache, 'day');
	} catch (e) {
		console.error(e);
		return false;
	}
}
