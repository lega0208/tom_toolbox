/* eslint-disable flowtype-errors/show-errors */
// @flow
import Trilogy from 'trilogy';
import { getAcrosModel } from './models';
import { CACHE_FILE } from '../constants';

class Cache {
  constructor() {
    this.db = new Trilogy(CACHE_FILE, { client: 'sql.js' });
	  this.ensureTable()
		  .then(() => console.log('Acronyms table exists'))
		  .catch(e => console.error(`Error ensuring Acronyms table exists:\n${e}`));
  }
  knex() {
		return this.db.knex;
	}
	async ensureTable() {
		const acrosModel = await getAcrosModel(this.db);
		if (!this.db.hasModel('Acronyms')) {
			return acrosModel.create();
		}
	}
  async getAcroCount(acro, lang) {
    const countQuery = this.db.knex('Acronyms').where({ Acronym: acro })
			.andWhere(function() {
				return this.where('Language', lang).orWhere('Language', null);
			})
			.count('Acronym');
    return (await this.db.raw(countQuery, true))[0]['count("Acronym")'];
  }
  async getDef(acro, lang) {
    const defQuery = this.db.knex('Acronyms').where({ Acronym: acro })
			.andWhere(function() {
				return this.where('Language', lang).orWhere('Language', null);
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
					return this.whereIn('Language', [lang, null]);
				})
				.select('Acronym', 'Definition');
			return this.db.raw(defsQuery, true);
		}
			const defsQuery = this.db.knex('Acronyms').where({ Acronym: acros })
				.andWhere(function() {
					return this.whereIn('Language', [lang, null]);
				})
				.select('Acronym', 'Definition'); // SELECT 'Definition' from 'Acronyms' where 'Acronym' = acro
			 												            // AND WHERE 'Language' IN (lang, null);
			return this.db.raw(defsQuery, true);
  }
  async insertOne(data: {ID: number, Acronym: string, Definition: string, Language: ?string}) {
  	const acroModel = await getAcrosModel(this.db);
  	try {
			return await acroModel.create(data);
		} catch (e) {
  		console.error(`Error in acroModel.create():\n${e}`);
		}
	}
	async insertAll(arr) {
  	while (arr.length > 0) {
			const queue = arr.splice(0, 499);
			const query = this.db.knex('Acronyms').insert(queue);

			try {
				this.db.raw(query, false);
				console.log('insertAll transaction completed.');
			} catch (e) {
				console.error(`Error in insertAll transaction:\n${e}`);
			}
		}
	}
  close() {
    this.db.close()
			.then(() => console.log('db connection closed'))
	    .catch(e => console.error(`Error closing the database?\n${e}`));
  }
}
export default () => new Cache();

