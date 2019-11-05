import { connect } from 'trilogy';
import { stat, exists } from 'fs-extra';
import { getLandingPagesModel } from './models';
import { getPaths } from 'database/paths-interface';
import { PATHS_CACHE_PATH, PATHS_DB_PATH } from '../constants';

class Cache {
	constructor() {
		this.db = connect(PATHS_CACHE_PATH, { client: 'sql.js' });

		console.log('first fucking run:');
		console.log(this.db.models);

		this.ensureTable()
			.then(() => console.log('Landing table exists:'))
			.catch(e => console.error(`Error ensuring Acronyms table exists:\n${e}`));
	}

	async ensureTable() {
		console.log('ensuring table (paths)');
		if (!(await this.db.hasModel('LandingPages'))) {
			console.log('creating landingPagesModel');
			this.landingPagesModel = await getLandingPagesModel(this.db);
			console.log('created landingPagesModel?');
			return await this.updateCache();
		}
	}

	async validateCache() {
		const dbLastModified = (await stat(PATHS_DB_PATH)).mtime;
		const cacheExists = await exists(PATHS_CACHE_PATH);
		const cacheLastModified = (await stat(PATHS_CACHE_PATH)).mtime;

		if (!cacheExists || dbLastModified > cacheLastModified) {
			await this.clear();
			await this.ensureTable();
			await this.updateCache();
		}
	}

	async updateCache() {
		const paths = await getPaths();
		console.log('Updating cache with paths:');
		console.log(paths);
		return await this.insertAll(paths);
	}

	async getLandingPages() {
		return await this.landingPagesModel.get('filepath');
	}

	async getHomepages() {
		return await this.landingPagesModel.get('filepath', { isHomepage: true });
	}

	async getIsHomepage(filepath) {
		return await this.landingPagesModel.get('isHomepage', { filepath });
	}

	async getTomNames() {
		const query = this.db.knex('LandingPages').distinct('tomName');

		const results = await this.db.raw(query, true);
		console.log(results);

		return results;
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
			const queue = arr.splice(0, 499);
			const query = this.db.knex('LandingPages').insert(queue);

			try {
				this.db.raw(query, false);
				console.log('insertAll [LandingPages] transaction completed.');
			} catch (e) {
				console.error(`Error in insertAll transaction:\n${e}`);
			}
		}
	}

	async clear() {
		return await this.db.clear();
	}

	close() {
		this.db.close()
			.then(() => console.log('db connection closed'))
			.catch(e => console.error(`Error closing the database?\n${e}`));
	}
}

let cache;

export default () => cache || (cache = new Cache());

