import { DISTRIB_PATH, PATHS_DB_PATH } from '../../app/constants';
import ADODB from 'node-adodb-electronfork';

process.env.DEBUG = 'ADODB';

class DataInterface {
	constructor(dbPath) {
		this.dbPath = dbPath;
		// todo: get data provider dynamically (check if driver exists)
		this.datasource = `Provider=Microsoft.Ace.OLEDB.12.0;Data Source=${this.dbPath};Persist Security Info=False;`;

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
		console.log('getAll from accdb');
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
	close() {
		this.db.close();
	}
}

const db = new DataInterface(PATHS_DB_PATH);

// Will probably need to move this to a cache function, and then just read the cache from here
export async function getPaths() {
	console.log('getting paths from accdb');
	try {
		return await db.getAll('LandingPages');
	} catch (e) {
		console.error('Error getting paths from paths DB');
		console.error(e);
	}
}

export default db;
