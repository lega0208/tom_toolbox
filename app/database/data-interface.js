
// @flow
import { join } from 'path';
import moment from 'moment';
import { ensureFileSync, readFileSync, writeFileSync, copy, exists, stat } from 'fs-extra';
import ADODB from 'node-adodb-electronfork';
import {
	APP_DIR,
	DB_PATH,
	DEFAULT_DB_PATH,
	DB_DRIVER_PATH,
	DB_DRIVER,
	LOCAL_DB_PATH,
} from '@constants';
import { measureTime } from 'lib/util';

process.env.DEBUG = 'ADODB';

function getDBPath() {
	try {
		ensureFileSync(DB_PATH);
		return readFileSync(DB_PATH, 'utf-8') || DEFAULT_DB_PATH;
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

export async function getDbLastModified(localPath = '') {
	const dbPath = localPath ? localPath : getDBPath();

	return stat(dbPath).then(stat => stat.mtimeMs);
}

async function copyToAppDir() {
	const localDbExists = await exists(LOCAL_DB_PATH);

	if (!localDbExists || await getDbLastModified() > await getDbLastModified(LOCAL_DB_PATH)) {
		console.log('Updating local Access DB');
		const dbPath = getDBPath();
		return await copy(dbPath, LOCAL_DB_PATH);
	}
}

class DataInterface {
  constructor(dbPath) {
		this.dbPath = dbPath || getDBPath();
		this.dbDriver = getDBDriver();
		this.datasource = `Provider=Microsoft.${this.dbDriver}.0;Data Source=${LOCAL_DB_PATH};Persist Security Info=False;`;
		console.log(`db path: ${this.dbPath}`);
		console.log(`db driver: ${this.dbDriver}`);
		this.init().then(() => {});
  }

  async init() {
	  try {
	  	const measureCopying = measureTime();
		  await copyToAppDir();
		  console.log(`copying to app dir took ${measureCopying()}`);
		  this.db = ADODB.open(this.datasource);
	  } catch (e) {
	  	console.error('Error initializing dataInterface 😐');
	  	console.error(e);
		  throw e;
	  }
  }

  async select(fields, table, constraints = '') {
  	constraints = constraints && ` ${constraints}`;
    await this.query(`SELECT ${fields} from ${table}${constraints}`);
  }
  async insert(table, values: {Acronym: string, Definition: string, Language: ?string}) {
		const { Acronym, Definition, Language } = values;
		const date = moment().format('YYYY-MM-DD');
		const time = moment().format('HH:mm:ss A');

		const fields = '([Acronym], [Definition], [Language], [Date Modified], [Time Modified])';
    const statement =
			`INSERT INTO ${table} ${fields} VALUES ('${Acronym}', '${Definition}', '${Language}', '${date}', '${time}');`;

    try {
			return await this.execute(statement);
		} catch (e) {
			console.error(`Error inserting in db:\n${e}`);
			throw e;
		}
  }
  async update(table, field, value, id) {
    const statement = `UPDATE ${table} SET ${field}=${value} WHERE [ID]='${id}'`;
		await this.execute(statement);
  }
  async remove(table, id) {
    const statement = `DELETE FROM ${table} WHERE [ID]=${id}`;
		await this.execute(statement);
  }
  async getAll(table, fields) {
  	const acroFields = '[Acronym], [Definition], [Language]';
  	const landingsFields = '[filepath], [tomName], [isHomepage]';

  	if (!fields) {
  		switch (table) {
			  case 'Acronyms':
				  fields = acroFields;
				  break;
			  case 'LandingPages':
				  fields = landingsFields;
				  break;
			  default:
			  	fields = '*';
		  }
	  }
	  console.log(`SELECT ${fields} FROM ${table};`);
		return this.query(`SELECT ${fields} FROM ${table};`);
  }
	async getAllUpdated(table, since = '1970-01-01') {
		const statement = `SELECT * FROM ${table} WHERE [lastModified] > DateValue('${0}');`; // todo
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
				const measureQuery = measureTime();
				const result = await this.db.query(statement);
				console.log(`db query took ${measureQuery()}`);
				return result;
			} catch (e) {
				console.error(`Error in DataInterface\nQuery: ${statement}`);
				throw e;
			}
		} else {
			throw new Error('No active database connection');
		}
	}
}

const dataInterface = new DataInterface();

export default dataInterface;
