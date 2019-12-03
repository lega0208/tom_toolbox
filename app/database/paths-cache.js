import { connect } from 'trilogy';
import { stat, exists } from 'fs-extra';
import { getLandingPagesModel } from './models';
import { getPaths } from 'database/paths-interface';
import { PATHS_CACHE_PATH, PATHS_DB_PATH } from '../constants';
import { measureTime } from 'lib/util';

class Cache {
	constructor() {
		this.db = connect(PATHS_CACHE_PATH, { client: 'sql.js' });
		console.log('pathsCache connected');
		this.ensureTable()
			.then(() => console.log('Landing table exists'))
			.catch(e => console.error(`Error ensuring Acronyms table exists:\n${e}`));
	}

	async ensureTable() {
		console.log('ensuring table (paths)');
		if (!(await this.db.hasModel('LandingPages'))) {
			const model = await getLandingPagesModel(this.db);

			if (process.env.NODE_ENV === 'development') {
				model.onQuery(console.log, { includeInternal: true });
			}
		}
	}

	async validateCache() {
		const measureTimeEnd = measureTime();
		const landings = await getLandingPagesModel(this.db);
		const dbLastModified = (await stat(PATHS_DB_PATH)).mtimeMs;
		const cacheLastModified = (await stat(PATHS_CACHE_PATH)).mtimeMs;
		console.log(`cacheLastModified took ${measureTimeEnd()}`);
		const count = landings.count();
		console.log(`landings.count() took ${measureTimeEnd()}`);

		if (dbLastModified > cacheLastModified || (await count) < 1) {
			console.log('Updating LandingPages cache');
			await this.clear();
			console.log(`Clearing cache took ${measureTimeEnd()}`);
			await this.updateCache();
			console.log(`Updating cache took ${measureTimeEnd()}`);
			console.log(`[LandingPages] updated, and now has ${await landings.count()} rows of data`);
			console.log(`landings.count() took ${measureTimeEnd()}`);
		} else {
			console.log(`validateCache took ${measureTimeEnd()}`);
			console.log('LandingPages cache already up to date');
		}
	}

	async updateCache() {
		const paths = await getPaths();
		console.log('Updating cache with paths:');
		return await this.insertAll(paths);
	}

	async getPageData(filepath) {
		const landings = await getLandingPagesModel(this.db);
		return (await landings.find({ filepath })) || [];
	}

	async getLandingPages() {
		const landings = await getLandingPagesModel(this.db);
		return await landings.find()
	}

	async getHomepages() {
		const landings = await getLandingPagesModel(this.db);
		return await landings.get('filepath', { isHomepage: true }, []);
	}

	async getIsHomepage(filepath) {
		const landings = await getLandingPagesModel(this.db);
		return (await landings.get('isHomepage', { filepath })).length > 0;
	}

	async getLastUpdated(since) {
		const landings = await getLandingPagesModel(this.db);

		if (since) {
			return new Date((await landings.max('created_at', ['created_at', '>', since])).created_at).getTime();
		}

		return new Date((await landings.max('created_at')).created_at).getTime();
	}

	async getTomNames() {
		const query = this.db.knex('LandingPages').distinct('tomName');

		return (await this.db.raw(query, true)).map(({ tomName }) => tomName);
	}

	async getHomepagesByTom() {
		const query = this.db.knex
			.with('SortedTable', qb => qb.select('*').from('LandingPages').orderBy(['tomName', 'filepath']))
			.select('A.tomName, A.filepath as filepath1, B.filepath as filepath2')
			.from('SortedTable A, SortedTable B')
			.whereNot('A.ID', 'B.ID')
			.andWhere({
				'A.tomName': 'B.tomName',
				'A.isHomepage': true,
				'B.isHomepage': true,
			})
			.orderBy('A.tomName');

		return await this.db.raw(query, true);
	}

	async insertAll(arr) {
		while (arr.length > 0) {
			const queue = arr.splice(0, 500);
			const query = this.db.knex('LandingPages').insert(queue);

			try {
				this.db.raw(query, false);
				console.log('insertAll [LandingPages] transaction completed.');
			} catch (e) {
				console.error(`Error in insertAll [LandingPages] transaction:\n${e}`);
			}
		}
	}

	async clear() {
		const landingPages = this.db.getModel('LandingPages');
		await landingPages.clear();
		console.log(`LandingPages cleared. Table now has ${await landingPages.count()} rows`);
	}

	close() {
		this.db.close()
			.then(() => console.log('db connection closed'))
			.catch(e => console.error(`Error closing the database?\n${e}`));
	}
}

let cache;

export default () => cache || (cache = new Cache());

