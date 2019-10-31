/* eslint-disable flowtype-errors/show-errors */
// @flow
import { readFileSync, writeFileSync } from 'fs';
import moment from 'moment';
import { ensureFileSync } from 'fs-extra';
import ADODB from 'node-adodb-electronfork';
import {
	DB_PATH,
	DEFAULT_DB_PATH,
	DB_DRIVER_PATH,
	DB_DRIVER,
} from '../constants';

process.env.DEBUG = 'ADODB';

function getDBPath() {
	ensureFileSync(DB_PATH);
	try {
		return readFileSync(DB_PATH, 'utf-8');
	} catch (e) {
		console.error(e);
	}
}
function getDBDriver() {
	ensureFileSync(DB_DRIVER_PATH);
	try {
		const dbDriver = readFileSync(DB_DRIVER_PATH, 'utf-8');
		if (!dbDriver) {
			writeFileSync(DB_DRIVER_PATH, DB_DRIVER, 'utf-8');
			return DB_DRIVER;
		} else {
			return dbDriver
		}
	} catch (e) {
		console.error(e);
	}
}

class DataInterface {
  constructor(dbPath) {
		this.dbPath = dbPath || getDBPath() || DEFAULT_DB_PATH;
		this.dbDriver = getDBDriver();
		// todo: get data provider dynamically (check if driver exists)
		this.datasource = `Provider=Microsoft.${this.dbDriver}.0;Data Source=${this.dbPath};Persist Security Info=False;`;
		console.log(`db path: ${this.dbPath}`);
		console.log(`db driver: ${this.dbDriver}`);
		try {
			this.db = ADODB.open(this.datasource);
		} catch (e) {
			throw e;
		}
  }
  async select(query) {
    await this.query(query);
  }
  async insert(table, values: {Acronym: string, Definition: string, Language: ?string}) {
		const { Acronym, Definition, Language } = values;
		const date = moment().format('YYYY-MM-DD');
		const time = moment().format('HH:mm:ss A');

		const fields = '([Acronym], [Definition], [Language], [Date Modified], [Time Modified])';
    const statement =
			`INSERT INTO ${table} ${fields} VALUES ('${Acronym}', '${Definition}', '${Language}', '${date}', '${time}');`;

    try {
			await this.execute(statement);
		} catch (e) {
			console.error(`Error inserting in db:\n${e}`);
			throw e;
		}

		// todo: change to scalar
		const getMaxID = `SELECT Max([ID]) from ${table}`; // not sure how I feel about an insert function returning a query result
    return this.query(getMaxID);
  }
  async update(table, field, value, id) {
    const statement = `UPDATE ${table} SET ${field}=${value} WHERE [ID]='${id}'`;
		await this.execute(statement);
  }
  async remove(table, id) {
    const statement = `DELETE FROM ${table} WHERE [ID]=${id}`;
		await this.execute(statement);
  }
  async getAll() {
    const statement = 'SELECT * FROM Acronyms;';
		return this.query(statement);
  }
	async execute(statement) {
		if (this.db) {
			try {
				return await this.db.execute(statement);
			} catch (e) {
				console.error(`Error in DataInterface\nQuery: ${statement}\n${e}`);
				throw e;
			}
		} else {
			console.error('No active connection');
			throw new Error('No active connection');
		}
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
export default new DataInterface();
