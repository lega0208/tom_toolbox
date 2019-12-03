import db, { getDbLastModified } from 'database/data-interface';
import getCache from 'database/cache';
import { formatDate } from 'database/util';
import { LOCAL_DB_PATH } from '@constants';

export default async function validateCache() {
	console.time('validateCache()');
	console.groupCollapsed('validateCache()');
	console.time('getCache');
	const cache = await getCache();
	console.timeEnd('getCache');
	console.time('dbLastModified()');
	const dbLastModified = getDbLastModified(LOCAL_DB_PATH);
	console.timeEnd('dbLastModified()');
	const tables = [
		'Acronyms',
		'LandingPages',
	];

	console.time('tables loop');
	for (const table of tables) {
		const lastCache = Date.parse(localStorage.getItem(`lastCache.${table}`));

		if (isNaN(lastCache)) {
			console.log('lastCache is NaN');
			await cache.repopulate(table);
			localStorage.setItem(`lastCache.${table}`, formatDate());
			continue;
		}

		if (lastCache < await dbLastModified) {
			console.log('lastCache < await dbLastModified');
			const queryResult = (await db.query(`SELECT MAX([lastModified]) FROM ${table} WHERE [lastModified] IS NOT NULL`))[0]['Expr1000'];
			const lastModified = Date.parse(queryResult);

			if (isNaN(lastModified)) {
				throw new Error(`Error in validateCache (${table}) - lastModified is NaN`);
			} else if (lastCache < lastModified) {
				await cache.repopulate(table);
				localStorage.setItem(`lastCache.${table}`, formatDate());
			}
		}
	}
	console.timeEnd('tables loop');
	console.groupEnd();
	console.timeEnd('validateCache()');
}

