import moment from 'moment';
import { ensureFile, readFile, outputFile } from 'fs-extra';
import cache from './cache';
import { LAST_CACHE } from '../constants';
import Worker from './cache.Worker';

let worker = new Worker();
async function queryDb(query) {
	if (!worker) worker = new Worker();

	return new Promise((res, rej) => {
		worker.onmessage = (msg) => {
			if (msg.data.error) {
				rej(msg.data.error);
			} else {
				res(msg.data.result);
			}
		};

		worker.postMessage({ query });
	});
}

export default async function checkCache(forceCache: ?boolean): void {
	const dbCache = cache();
	console.log('checking cache??');
	try {
		const lastCache = await readLastCache() || '';

		// If the Toolbox is updated, localStorage isn't cleared, so we need to clear it here
		if (!lastCache) {
			localStorage.setItem('lastCheck', moment('1970-01-01').toISOString())
		}

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
	} catch (e) {
		throw new Error(e);
	}
}

async function shouldCheck() {
	// todo: switch to file or something
	const lastCheck = localStorage.getItem('lastCheck') || null;
	console.log(`lastCheck: ${lastCheck}`);

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
		return queryDb(query);
	}
	try {
		const query = 'SELECT [Acronym], [Definition], [Language] FROM Acronyms';
		return queryDb(query);
	} catch (e) {
		console.error(`Error getting updated data:`);
		throw e;
	}
}

async function shouldUpdateCache(lastCache = '1970-01-01') {
	if (moment().isSame(lastCache, 'day')) {
		console.log('Already cached data today.');
		return false;
	}
	const query = 'SELECT MAX ([Date Modified]) FROM Acronyms';
	const resultArr = (await queryDb(query)) || [];
	const result = (resultArr.length && resultArr[0].hasOwnProperty('Expr1000')) ? resultArr[0].Expr1000 : null;

	if (result) {
		const lastUpdate = moment(result);
		console.log(`Last update: ${lastUpdate.format('YYYY-MM-DD')}`);
		const _lastCache = moment(lastCache);
		console.log(`Last cache: ${_lastCache.format('YYYY-MM-DD')}`);

		return lastUpdate.isAfter(_lastCache, 'day');
	} else {
		throw new Error('Error getting result from database.')
	}
}
