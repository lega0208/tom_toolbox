import moment from 'moment';
import { ensureFile, exists, readFile, outputFile, stat } from 'fs-extra';
import { measureTime } from 'lib/util';
import db from './data-interface';
import cache from './cache';
import { LAST_CACHE, DB_PATH, DEFAULT_DB_PATH } from '@constants';

export default async function checkCache(forceCache: ?boolean): void {
	const measureTimeEnd = measureTime();
	const dbCache = await cache();
	try {
		const lastCache = await readLastCache() || '';
		if ((await shouldCheck()) && (!lastCache || forceCache)) {
			console.log('No lastCache, caching data');
			await cacheData(dbCache);
			localStorage.setItem('lastCheck', moment().toISOString());
		} else if ((await shouldCheck()) && (await shouldUpdateCache(lastCache))) {
			await cacheData(dbCache, lastCache);
			localStorage.setItem('lastCheck', moment().toISOString());
		} else {
			console.log('Data not cached');
		}
		console.log(`cacheCheck took ${measureTimeEnd()}`);
	} catch (e) {
		throw new Error(e);
	}
}

async function shouldCheck() {
	// todo: switch to file or something
	const lastCheck = localStorage.getItem('lastCheck') || null;

	if (lastCheck) {
		const _lastCheck = moment(lastCheck);
		const today = moment().startOf('day');
		return _lastCheck.isBefore(today);
	}
	return true;
}

async function cacheData(dbCache, lastCache) {
	// only update data that's been updated since last cache
	try {
		const data = (lastCache ? await getUpdatedData(lastCache) : await getUpdatedData()) || [];
		console.log(`Results found: ${data.length}`);
		await dbCache.clear();
		await dbCache.insertAll(data);
		await writeLastCache();
	} catch (e) {
		console.error(`Error caching data:`);
		throw e;
	}
}

async function writeLastCache() {
	try {
		await outputFile(LAST_CACHE, moment().toISOString(), 'utf-8');
	} catch (e) {
		console.error(`Error writing .lastCache:`);
		throw e;
	}
}

async function readLastCache() {
	try {
		await ensureFile(LAST_CACHE);
		return await readFile(LAST_CACHE, 'utf-8');
	} catch (e) {
		console.error(`Error reading .lastCache:`);
		throw e;
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
		console.error(`Error getting updated data:`);
		throw e;
	}
}

async function shouldUpdateCache(lastCache = '1970-01-01') {
	const measureTimeEnd = measureTime();
	const dbPath = (await exists(DB_PATH)) ? (await readFile(DB_PATH)) : DEFAULT_DB_PATH;

	if (await exists(dbPath)) {
		const dbLastModified = await stat(DB_PATH).mtime;
		if (Date.parse(lastCache) > Date.parse(dbLastModified)) {
			console.log('Cache already up to date');
			console.log(`shouldUpdateCache took ${measureTimeEnd()}`);
			return false;
		}

		console.log(`Last update: ${moment(dbLastModified).format('YYYY-MM-DD')}`);
		console.log(`Last cache: ${moment(lastCache).format('YYYY-MM-DD')}`);
		console.log(`shouldUpdateCache took ${measureTimeEnd()}`);
		return true;
	}

	throw new Error('Database not found.')
}
