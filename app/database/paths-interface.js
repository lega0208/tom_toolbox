import { DISTRIB_PATH } from '../../app/constants';
import ADODB from 'node-adodb-electronfork';

process.env.DEBUG = 'ADODB';

class DataInterface {
	constructor(dbPath) {
		this.dbPath = dbPath;
		// todo: get data provider dynamically (check if driver exists)
		this.datasource = `Provider=Microsoft.${'Ace.OLEDB.12'}.0;Data Source=${this.dbPath};Persist Security Info=False;`;

		try {
			this.db = ADODB.open(this.datasource);
			console.log('PagesDB connection successful!');
		} catch (e) {
			throw e;
		}
	}
	async select(query) {
		await this.query(query);
	}
	async getAll(table) {
		const statement = `SELECT * FROM ${table};`;
		return this.query(statement);
	}
	async query(statement) {
		if (this.db) {
			try {
				return await this.db.query(statement);
			} catch (e) {
				console.error(`Error in DataInterface\nQuery: ${statement}`);
				throw e;
			}
		} else {
			throw new Error('No active database connection');
		}
	}
}

// Will probably need to move this to a cache function, and then just read the cache from here
export async function getPaths() {
	const db = new DataInterface(`${DISTRIB_PATH}PagesDB.accdb`);
	const homepages = {};
	const landingPages = {};
	const timestamp = Date.now();

	for (const homepage of (await db.getAll('homepages'))) {
		if (!homepages[homepage.tomName]) {
			homepages[homepage.tomName] = [];
		}
		homepages[homepage.tomName].push(homepage.filepath);
	}

	for (const landingPage of (await db.getAll('landingPages'))) {
		if (!landingPages[landingPage.tomName]) {
			landingPages[landingPage.tomName] = [];
		}
		landingPages[landingPage.tomName].push(landingPage.filepath);
	}

	return {
		homepages,
		landingPages,
		timestamp,
	};
}

export default new DataInterface(`${DISTRIB_PATH}PagesDB.accdb`);
