/* eslint-disable flowtype-errors/show-errors */
// @flow
import { connect } from 'trilogy';
import accDb from 'database/data-interface';
import { getAcrosModel, getLandingPagesModel } from './models';
import { CACHE_FILE } from '@constants';

type Acronym = {
	ID: number,
	Acronym: string,
	Definition: string,
	Language: ?string,
	created_at?: Date,
};

type LandingPage = {
	ID: number,
	filepath: string,
	tomName: string,
	isHomepage: boolean,
	created_at?: Date,
};

class Cache {
  constructor() {
    this.db = connect(CACHE_FILE, { client: 'sql.js' });
    this.tablesEnsured = false;
  }

	get acros() {
		return this.db.getModel('Acronyms');
	}

	get landings() {
		return this.db.getModel('LandingPages');
	}

	getDb() {
  	return this.db;
	}

	async ensureTables() {
		if (!await this.db.hasModel('Acronyms') || !await this.db.hasModel('LandingPages')) {
			console.time('getModels');
			return getAcrosModel(this.db)
				.then(() => getLandingPagesModel(this.db))
				.then(() => this.tablesEnsured = true)
				.then(() => console.timeEnd('getModels'));
		}
	}

  async getAcroCount(acro, lang) {
    const countQuery = this.db.knex('Acronyms').where({ Acronym: acro })
			.andWhere(function() {
				return this.where('Language', lang).orWhereNull('Language');
			})
			.count('Acronym');

    return (await this.db.raw(countQuery, true))[0]['count(`Acronym`)'];
  }

  async getDef(acro, lang) {
    const defQuery = this.db.knex('Acronyms').where({ Acronym: acro })
			.andWhere(function() {
				return this.where('Language', lang).orWhereNull('Language');
			})
			.select('Definition');
    const def = await this.db.raw(defQuery, true);
    if (def.length > 0) {
      return def[0].Definition;
    }
      console.error(`No definition found for ${acro}(lang=${lang})`);
      return false;
  }

  async getDefs(acros, lang) {
		if (Array.isArray(acros)) {
			const defsQuery = this.db.knex('Acronyms')
				.whereIn('Acronym', acros)
				.andWhere(function() {
					return this.where({ Language: lang }).orWhereNull('Language');
				})
				.select('Acronym', 'Definition');

			return await this.db.raw(defsQuery, true);
		}
			const defsQuery = this.db.knex('Acronyms').where({ Acronym: acros })
				.andWhere(function() {
					return this.where({ Language: lang }).orWhereNull('Language');
				})
				.select('Acronym', 'Definition'); // SELECT 'Definition' from 'Acronyms' where 'Acronym' = acro
			 												            // AND WHERE 'Language' IN (lang, null);
			return this.db.raw(defsQuery, true);
  }

  async repopulate(tableName) {
  	console.log(`repopulating ${tableName}`);
  	if (!this.tablesEnsured) await this.ensureTables();
	  const model = this.db.getModel(tableName);
	  await model.clear();

	  return await accDb.getAll(tableName)
		  .then(data => {
		  	return this.insertAll(tableName, data);
		  });
  }

  async insert(modelName: 'acros' | 'landings', data: Acronym | LandingPage) {
  	try {
			return await this[modelName].create(data);
		} catch (e) {
  		console.error(`Error in acroModel.create():\n${e}`);
		}
	}

	async insertAll(table, arr) {
  	while (arr.length > 0) {
			const queue = arr.splice(0, 499);
			const query = this.db.knex(table).insert(queue);

			try {
				await this.db.raw(query, false);
				console.log('insertAll transaction completed.');
			} catch (e) {
				console.error(`Error in insertAll transaction:\n${e}`);
			}
		}
	}

	async clear(table) {
  	return await this.db.getModel(table).clear();
	}

  close() {
    this.db.close()
			.then(() => console.log('db connection closed'))
	    .catch(e => console.error(`Error closing the database?\n${e}`));
  }
}

const cache = new Cache();
let tablesEnsured = false;
const ensureTask = cache.ensureTables();

const getEnsuredCache = async () => {
	if (!tablesEnsured) {
		await ensureTask;
		tablesEnsured = true;
	}

	return cache;
};

export default getEnsuredCache;

class PathsCache {
	constructor(db) {
		this.db = db;
		this.landings = this.db.getModel('LandingPages');
		this.landingFilepaths = null;
		this.tomNames = null;
		this.homepagesByTom = null;
	}

	async getHomepagesByTom() {
		if (this.homepagesByTom === null) {
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

			const queryResults = await this.db.raw(query, true);

			this.homepagesByTom = queryResults.reduce((acc, page) => ({
				...acc,
				[page.tomName]: [ page.filepath1, page.filepath2 ]
			}), {});
		}
		return this.homepagesByTom
	}

	async getTomNames() {
		if (this.tomNames === null) {
			const query = this.db.knex('LandingPages').distinct('tomName');

			this.tomNames = (await this.db.raw(query, true))
				.map(({ tomName }) => tomName);
		}

		return this.tomNames;
	}

	async getLandingPages(pathsOnly = false) {
		if (pathsOnly) {
			if (this.landingFilepaths === null) {
				this.landingFilepaths = (await this.landings.get('filepath'))
					.map(({ filepath }) => filepath);
			}
			return this.landingFilepaths;
		}

		return await this.landings.find();
	}

	async getPageData(filepath) {
		return this.landings.findOne({ filepath });
	}

	async checkIfLanding(filepath) {
		const queryResult = await this.landings.find({ filepath });
		console.log('pathsCache.checkIfLanding() results:');
		console.log(queryResult);
		return queryResult.length > 0;
	}
}

let pathsCache;
export async function getPathsCache() {
	const db = (await getEnsuredCache()).getDb();
	return pathsCache || (pathsCache = new PathsCache(db));
}
