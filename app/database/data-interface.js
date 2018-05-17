/* eslint-disable flowtype-errors/show-errors */
// @flow
import { readFileSync } from 'fs';
import moment from 'moment';
import { ensureFileSync } from 'fs-extra';
import ADODB from 'node-adodb-electronfork';
import { DB_PATH } from '../constants';

process.env.DEBUG = 'ADODB';

function getDBPath() {
	ensureFileSync(DB_PATH);
	try {
		return readFileSync(DB_PATH, 'utf-8');
	} catch (e) {
		console.error(e);
	}
}

class DataInterface { // this done?
  constructor(dbPath) {
		this.dbPath = dbPath || getDBPath() || 'C:\\Users\\Marc\\Desktop\\AcroDB.mdb'; // todo: add default db path?
		this.datasource = `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${this.dbPath};Persist Security Info=False;`; // todo get data provider dynamically (check if driver exists)
		this.db = ADODB.open(this.datasource);
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
		}

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
			}
		} else {
			console.error('Error: No active connection');
		}
	}
	async query(statement) {
		if (this.db) {
			try {
				return await this.db.query(statement);
			} catch (e) {
				console.error(`Error in DataInterface\nQuery: ${statement}\n${e}`);
			}
		} else {
			console.error('Error: No active connection');
		}
	}
}
export default new DataInterface();

// export type acrosResult = {
// 	ID: number,
// 	Acronym: string,
// 	Definition: string,
// 	Language: ?string
// }
