// @flow
/**
 * Insert into cache db and Access db in parallel
 */

import db from './data-interface';
import cache from './cache';

export default async function(data: {Acronym: string, Definition: string, Language: ?string}) {
	try {
		const dbCache = cache();
		const ID = (await db.insert('Acronyms', data))[0]['Expr1000'];
		try {
			await dbCache.insertOne({ID, ...data});
		} catch (e) {
			console.error('Error inserting into cache');
			await db.remove('Acronyms', ID);
		}
	} catch (e) {
		console.error(`Error inserting data for ${data.Acronym}:\n${e.stack}`);
	}
}

