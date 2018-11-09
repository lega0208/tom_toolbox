import Trilogy from 'trilogy';
import { getTOMDataModel } from './models';
import { CACHE_FILE } from '../constants';

class Cache {
	constructor() {
		this.db = new Trilogy(CACHE_FILE, { client: 'sql.js' });
		this.ensureTable().then(() => console.log('tomData table exists.')); // Promise
	}

	async ensureTable() {
		const tomDataModel = await getTOMDataModel(this.db);
		if (!this.db.hasModel('tomData')) {
			return tomDataModel.create();
		}
	}

	async getCachedData(tomName) {
		try {
			const model = await getTOMDataModel(this.db);

			const results = await model.find([ 'tomName', tomName ], { raw: true });
			console.log(`${results.length} results found`);

			return results;
			//return results.map((entry) => ({
			//	...entry,
			//	$: eval(`(${entry.$})`), // stringify function
			//}));
		} catch (e) {
			console.error(e);
			return [];
		}
	}

	async removeForUpdate(paths) {
		const model = await getTOMDataModel(this.db);

		while (paths.length > 0) {
			const queue = paths.splice(0, 10);
			const tasks = queue.map((path) => {
				model.remove({ path });
			});
			await Promise.all(tasks);
		}
	}

	async insertAll(arr) {
		//arr = arr.map((entry) => ({
		//	...entry,
		//	$: entry.$ + '', // stringify function
		//}));
		let totalRowsAffected = 0;

		while (arr.length > 0) {
			const queue = arr.splice(0, 5);
			const query = this.db.knex('tomData', true).insert(queue);

			try {
				const result = await this.db.raw(query);
				totalRowsAffected += result || 0;
			} catch (e) {
				console.error(`Error in validator insertAll transaction:\n${e}`);
				this.close();
				return;
			}
		}
		return totalRowsAffected;
	}

	close() {
		this.db.close()
			.then(() => console.log('db connection closed'))
			.catch(e => console.error(`Error closing the database?\n${e}`));
	}
}

export default () => new Cache();
