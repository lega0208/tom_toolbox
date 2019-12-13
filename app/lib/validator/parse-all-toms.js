import { basename, join, resolve } from 'path';
import { readFile, readJSON, outputFile, outputJSON } from 'fs-extra';
import cheerio from 'cheerio';
import {
	getBreadcrumbs,
	getChildren,
	getDates,
	getHeaders,
	getlangLink,
	getNavs,
	getSecMenu,
	getTitles,
	getToC
} from './parse-file-wet4';
import { wrapContent } from './util';
import { getPathsCache } from 'database/cache';

export const parseAllTOMs = async (outputPath = '.') => { // run from menu?
	//const outputObj = {};
	const errors = [];
	const pathsCache = await getPathsCache();
	const homepages = await pathsCache.getHomepagesByTom();

	for (const [tomName, tomHomepages] of Object.entries(homepages)) {
		const tomDataObj = await parseFromHomepage(tomHomepages, tomName, errors);
		try {
			await outputFile(join(outputPath, `${tomName}.json`), JSON.stringify(tomDataObj), 'utf8');
		} catch (e) {
			console.error(`\n\nError outputting JSON in ${tomName}`);
			console.error(e);
			console.error('');
		}
	}

	for (const error of errors) {
		console.error('');
		console.error(error);
	}
};

export const parseFromHomepage = async (paths, tomName, errors) => {
	const enHomepage = paths[0];
	const frHomepage = paths[1];
	const parsedFiles = {};
	const secMenus = { e: [], f: [] };

	for (const homepagePath of [ enHomepage, frHomepage ]) {
		const fileName = basename(homepagePath);
		console.log(`Parsing ${fileName}`);
		const fileContents = await readFile(homepagePath, 'utf8');
		const pageContents = (await wrapContent(fileContents, fileName)) || fileContents;
		const $ = cheerio.load(pageContents, { decodeEntities: false });

		const homepageData = {
			lastUpdated: Date.now(),
			path: homepagePath,
			depth: 0,
			isLanding: true,
			isHomepage: true,
			title: await getTitles($),
			date: await getDates($),
			langLink: await getlangLink($),
			headers: await getHeaders($),
			children: await getChildren($, homepagePath, tomName),
			breadcrumbs: {
				expected: [],
			},
		};

		const langRegex = /-([ef])\.html/;
		const lang = langRegex.exec(homepagePath)[1];
		secMenus[lang] = [ ...homepageData.children ];

		parsedFiles[homepagePath] = { ...homepageData };
		await parseChildren(homepageData, tomName, parsedFiles, errors);
	}

	return {
		homePage: enHomepage.replace('-e.html', ''),
		tomName,
		secMenu: secMenus,
		files: parsedFiles,
	}
};

const parseChildren = async (parentData, tomName, filesObj, errors) => {
	for (const child of parentData.children) {
		try {
			console.log(`Parsing ${basename(child.href)}`);
			const fileData = await parseFileData(child.href, tomName, parentData, errors);
			filesObj[child.href] = fileData;

			if (fileData.isLanding && fileData.children) {
				await parseChildren(fileData, tomName, filesObj, errors);
			}
		} catch (e) {
			console.log(e);
			errors.push({ filename: basename(child.href), error: e });
		}
	}
};

const parseFileData = async (path, tomName, parentData, errors) => {
	const fileName = basename(path);
	const fileContents = await readFile(path, 'utf8');
	const pageContents = (await wrapContent(fileContents, fileName)) || fileContents;
	const $ = cheerio.load(pageContents, { decodeEntities: false });

	const pathsCache = await getPathsCache();
	const isLanding = await pathsCache.checkIfLanding(path);

	return {
		path,
		lastUpdated: Date.now(),
		isLanding,
		isHomepage: false,
		depth: parentData.depth + 1,
		title: await getTitles($),
		date: await getDates($),
		langLink: await getlangLink($),
		breadcrumbs: await getBreadcrumbs($, path, parentData),
		secMenu: await getSecMenu($),
		nav: await getNavs($, path, errors),
		toc: await getToC($),
		headers: await getHeaders($),
		parent: parentData.path,
		children: isLanding ? (await getChildren($, path, tomName)) : null,
	};
};
