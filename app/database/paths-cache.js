import Trilogy from 'trilogy';
import { getLandingPagesModel } from './models';
import { PATHS_CACHE_FILE } from '../constants';

class Cache {
	constructor() {
		this.db = new Trilogy(PATHS_CACHE_FILE, { client: 'sql.js' });
		this.ensureTable()
			.then(() => console.log('Acronyms table exists'))
			.catch(e => console.error(`Error ensuring Acronyms table exists:\n${e}`));
	}

	async ensureTable() {
		this.landingPagesModel = await getLandingPagesModel(this.db);
		if (!this.db.hasModel('LandingPages')) {
			return this.landingPagesModel.create();
		}
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

export default async () => new Cache();
