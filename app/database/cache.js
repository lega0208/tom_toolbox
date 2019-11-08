/* eslint-disable flowtype-errors/show-errors */
// @flow
import { connect } from 'trilogy';
import { getAcrosModel } from './models';
import { CACHE_FILE, LAST_CACHE, PATHS_CACHE_PATH, TOM_DATA_CACHE } from '../constants';
import fs from 'fs-extra';

class Cache {
  constructor() {
    this.db = connect(CACHE_FILE, { client: 'sql.js' });
	  this.ensureTable()
		  .then(() => console.log('Acronyms table exists'))
		  .catch(e => console.error(`Error ensuring Acronyms table exists:\n${e}`));
  }

	async ensureTable() {
		if (!await this.db.hasModel('Acronyms')) {
			return await getAcrosModel(this.db);
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

	async clear() {
  	return await this.db.clear('Acronyms');
	}

  close() {
    this.db.close()
			.then(() => console.log('db connection closed'))
	    .catch(e => console.error(`Error closing the database?\n${e}`));
  }
}

let cache;
export default async () => cache || (cache = new Cache());

export function clearCache() {
	const electron = process.type === 'renderer' ? require('electron').remote : require('electron');
	const currentWindow = electron.BrowserWindow.getAllWindows()[0];
	const session = currentWindow.webContents.session;

	fs.writeFileSync(CACHE_FILE, '', 'utf-8');
	fs.writeFileSync(LAST_CACHE, '', 'utf-8');
	fs.emptyDirSync(TOM_DATA_CACHE);
	fs.unlinkSync(PATHS_CACHE_PATH);

	session.clearStorageData({ storages: ['localStorage'] });

	currentWindow.reload();
}
