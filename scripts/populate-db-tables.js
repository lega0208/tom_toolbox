require('babel-register');
const fs = require('fs-extra');
const { homepages, landingPages } = require('../app/lib/validator/paths');
const { DISTRIB_PATH } = require('../app/constants');
const ADODB = require('../app/node_modules/node-adodb-electronfork');

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
	async insert(table, { filepath, tomName }) {
		const fields = '([filepath], [tomName])';
		const statement =
			`INSERT INTO ${table} ${fields} VALUES ('${filepath}', '${tomName}');`;

		try {
			await this.execute(statement);
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
	async getAll(table) {
		const statement = `SELECT * FROM ${table};`;
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


const db = new DataInterface(`${DISTRIB_PATH}PagesDB.accdb`);
(async function main() {
	const homepages = (await db.getAll('homepages')).map(({ filepath }) => filepath);

	const data = (await db.getAll('LandingPages'));

	const csv = data.map(({ filepath, tomName }, i) => {
		const basePath = '\\\\Omega.dce-eir.net\\NATDFS\\Services\\Central_storage\\Testing_ABSB_Secure\\IND\\';
		filepath = `${basePath}${tomName}\\${filepath}`;
		return `${i+1},${filepath},${tomName},${homepages.includes(filepath)}`
	}).join('\r\n');

	await fs.outputFile(`${process.env.USERPROFILE}\\Desktop\\landingPages.csv`, csv, 'utf8');
})()
	.then(() => console.log('donezo!'))
	.catch(e => console.error(e));

