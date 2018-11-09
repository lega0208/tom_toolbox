import { basename, dirname, join, resolve } from 'path';
import { landingPages } from 'lib/validator/paths';
import cache from 'database/validator-cache';
import { readFile, stat } from 'fs-extra';
import { wrapContent } from 'lib/validator/util';
import cheerio from 'cheerio';

export default class Validator {
	validationResults = {}; // final results object to be returned after validation
	data = {}; // data object populated by cached/parsed data to be used in validations
	errors = []; // push any errors here and then pass to alert
	childErrors = {}; // because parsing happens before validation, child errors need to be gathered seperately
	progress = 0; // files completed, for progress bar
	cacheData = []; // data loaded from the cache
	cacheQueue = []; // parsed file data to be bulk-inserted into the cache
	tomDeps = {}; // object containing data that will be frequently used when parsing

	constructor(homepages) {
		this.homepages = homepages; // [0]: en, [1]: fr
		this.dirPath = dirname(homepages[0]);
		this.tomName = basename(this.dirPath);
		//this.landingPages = readJSONSync('app/lib/validator/landing-pages.json')[this.tomName]
		this.landingPages = landingPages[this.tomName]
			.map((filePath) => resolve(this.dirPath, filePath)); // abs path of all landing pages
		this.cache = cache();
	}

	// Progress methods
	incrementProgress() {
		this.progress += 1;
	}
	getProgress() {
		return this.progress;
	}
	resetProgress() {
		this.progress = 0;
	}

	/* * * * * * * * * * * * parsing methods * * * * * * * * * * * */
	//async parseAndCache(filePath) {
	//	const fileName = basename(filePath);
	//
	//	try {
	//		const fileContents = await readFile(filePath, 'utf8');
	//		const pageContents = (await wrapContent(fileContents, fileName) || fileContents);
	//		const $ = cheerio.load(pageContents, { decodeEntities: false });
	//
	//		const fileData = {
	//			path: filePath,
	//			$,
	//			tomName: this.tomName,
	//			updated_at: Date.now(),
	//		};
	//
	//		this.cacheQueue.push({ ...fileData, $: stringify($.root()) });
	//		// do one at a time? or maybe batch the insertAll
	//
	//		return fileData;
	//	} catch (e) {
	//		console.error(`Error parsing file ${fileName}`);
	//		console.error(e);
	//		this.addError(e);
	//		throw e;
	//	}
	//}
	//async getOrParse(filePath) {
	//	try {
	//		const fileData = this.cacheData[filePath];
	//
	//		if (fileData) {
	//			const lastCache = fileData['updated_at'];
	//			const lastModified = (await stat(filePath)).mtime;
	//
	//			const lastCacheDate = Date.parse(lastCache);
	//			const lastModifiedDate = Date.parse(lastModified);
	//
	//			// if file was modified after last cache, parse & add to cache queue
	//			if (lastModifiedDate > lastCacheDate) {
	//				console.log('File was modified after caching, need to re-cache.');
	//				return this.parseAndCache(filePath);
	//			} else {
	//				return fileData;
	//			}
	//		} else {
	//			return this.parseAndCache(filePath);
	//		}
	//	} catch (e) {
	//		console.error(`Error getting or parsing ${basename(filePath)}`);
	//		console.error(e);
	//		this.addError(e);
	//	}
	//}
	//async getChildren($, path) {
	//	const contentRef = $('div#__main-content');
	//
	//	const fileName = basename(path);
	//	const getNormalChildren = () => contentRef
	//		.find('li > a')
	//		.toArray()
	//		.map(a => join(`${path}/..`, a.attribs.href));
	//
	//	if (!/TOM(?:56|4095)/.test(this.tomName)) {
	//		return getNormalChildren();
	//	} else { // They have landing pages that don't conform
	//		const regex = /asl_5600-[ef]\.html/;
	//		if (this.tomName === 'TOM56') {
	//			if (regex.test(fileName)) {
	//				return contentRef
	//					.find('li > a')
	//					.filter((i, el) => $(el).find('strong').length > 0) // only links with strong are direct children
	//					.toArray()
	//					.map(a => join(`${path}/..`, a.attribs.href));
	//			} else {
	//				return getNormalChildren();
	//			}
	//		} else if (this.tomName === 'TOM4095') {
	//			const regex = /4095\.\(11\)_dectax-[ef]\.html|4095\.\(12\)_landing-[ef]\.html/;
	//
	//			if (regex.test(fileName)) {
	//				return contentRef
	//					.children()
	//					.first()    // ul
	//					.children() // lis
	//					.map((i, li) => $(li).children('a').get(0))
	//					.toArray()
	//					.map(a => join(`${path}/..`, a.attribs.href));
	//			} else {
	//				return getNormalChildren();
	//			}
	//		}
	//	}
	//}

	/* * * * * * * * * * * * cache methods * * * * * * * * * * * */
	//async getCachedData() {
	//	// format data w/ object to facilitate checks and stuff
	//	this.cacheData = (await this.cache.getCachedData(this.tomName))
	//		.map((data) => {
	//			const _$ = cheerio.load('<html/>', { decodeEntities: false, withDomLvl1: false });
	//			const $ = (selector) => _$(selector || ':root', data.$);
	//
	//			console.log($().html());
	//
	//			return {
	//				...data,
	//				$,
	//			};
	//		})
	//		.reduce((acc, fileData) => {
	//			acc[fileData.path] = fileData;
	//			return acc;
	//		}, {});
	//
	//	return this.cacheData;
	//}
	//async commitCacheUpdates() {
	//	try {
	//		const filePaths = this.cacheQueue.map(({ path }) => path);
	//		await this.cache.removeForUpdate(filePaths);
	//		console.log(`rows removed for update`);
	//		const insertResult = await this.cache.insertAll(this.cacheQueue);
	//		console.log(`${insertResult} rows inserted for update (should be the same)`);
	//		this.cacheQueue = [];
	//
	//		return insertResult;
	//	} catch (e) {
	//		console.error(`Error committing cache updates:`);
	//		console.error(e);
	//		this.errors.push(e);
	//	}
	//}

	/* * * * * * * * * * * * get/set methods * * * * * * * * * * * */
	getValidationResults() {
		return this.validationResults;
	}
	addValidationResults(path, results) {
		this.validationResults[path] = results;
	}

	getData() {
		return this.data;
	}
	addData(path, data) {
		this.data[path] = data;
	}

	getErrors() {
		return this.errors;
	}
	addError(e) {
		this.errors.push(e);
	}

	getChildErrors(pagePath) {
		return this.childErrors[pagePath];
	}
	addChildErrors(pagePath, errors = []) {
		if (errors.length > 0) {
			if (!this.childErrors[pagePath]) {
				this.childErrors[pagePath] = [];
			}

			this.childErrors[pagePath].push(...errors);
		}
	}

	setTOMDeps(tomDeps) {
		this.tomDeps = tomDeps;
	}
}