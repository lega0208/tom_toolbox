// @flow
import cheerio from 'cheerio';
import { basename } from 'path';
import { pathExists, readFile } from 'fs-extra';
import { getPathsCache } from 'database/cache';
import { wrapContent } from './util';
import { FileData, TOMDataType } from './types';
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

const parseNewData = async (path, isHomepage, isLanding, parentData, tomName) => {
	const fileName = basename(path);
	const fileContents = await readFile(path, 'utf8');
	const pageContents = (await wrapContent(fileContents, fileName) || fileContents);
	const $ = cheerio.load(pageContents, { decodeEntities: false });

	if (isHomepage) {
		return {
			lastUpdated: Date.now(),
			title: await getTitles($),
			date: await getDates($),
			langLink: await getlangLink($),
			breadcrumbs: {
				expected: [],
			},
			headers: await getHeaders($),
			children: await getChildren($, path, tomName),
		};
	}

	const data = {
		lastUpdated: Date.now(),
		title: await getTitles($),
		date: await getDates($),
		langLink: await getlangLink($),
		breadcrumbs: await getBreadcrumbs($, path, parentData),
		secMenu: await getSecMenu($),
		nav: await getNavs($),
		toc: await getToC($),
		headers: await getHeaders($),
		children: isLanding ? (await getChildren($, path, tomName)) : [],
	};

	return data;
};

const createNewFileData = async (path, parentData, tomName) => {
	console.log(`This should be abs path: -> ${path}`);
	const pathsCache = await getPathsCache();
	const isLanding = await pathsCache.checkIfLanding(path);
	return {
		path,
		depth: parentData.depth + 1,
		isLanding,
		parent: parentData.path,
		...(await parseNewData(path, false, isLanding, parentData, tomName)),
	};
};

export async function updateCachedData(path: string, tomData: TOMDataType): Promise<?FileData> {
	const { files, tomName, secMenu } = tomData;
	const pathsCache = await getPathsCache();
	const fileLandingData = await pathsCache.getPageData(path);
	const isLanding = !!fileLandingData;
	const isHomepage = isLanding && fileLandingData.isHomepage;

	const oldFileData: ?FileData = files[path]; // if it's been deleted, it's now undefined and can be skipped
	if (!oldFileData) return;

	const parentData: ?FileData = oldFileData.parent ? files[oldFileData.parent] : null;

	const newFileData = await parseNewData(path, isHomepage, isLanding, parentData, tomName);

	const combinedData: FileData = { ...oldFileData, ...newFileData };

	files[path] = combinedData;

	if (isLanding) {
		// check that each href was in the old children
		//  if not, check if the file existed in the tomData, and if not, parse and add the file to tomData.files
		const oldChildren = oldFileData.children || [];
		const newChildren = newFileData.children || [];

		if (oldFileData.isHomepage) {
			console.log('old children:');
			console.log(oldChildren);
			console.log('new children:');
			console.log(newChildren);

			const langRegex = /-([ef])\.html/;
			const lang = langRegex.exec(path)[1];

			if (newChildren.length > oldChildren.length) {
				secMenu[lang] = newChildren;
			} else {
				for (const [ i, oldChild ] of oldChildren.entries()) {
					if (!newChildren[i] || oldChild.text !== newChildren[i].text || oldChild.href !== newChildren[i].href) {
						//console.log('secMenu updating:');
						//console.log('old secMenu:');
						//console.log(secMenu[lang]);
						secMenu[lang] = newChildren;
						//console.log('new secMenu:');
						//console.log(secMenu[lang]);
						break; //  exit the loop if any change is found
					}
				}
			}
		}

		const newChildHrefs = newChildren.map((child) => child.href);
		const oldChildHrefs = oldChildren.map((child) => child.href);

		const addedChildren = newChildHrefs
			.filter((child) => !oldChildHrefs.includes(child));
		const removedChildren = oldChildHrefs
			.filter((child) => !newChildHrefs.includes(child));

		for (const child of addedChildren) {
			await cascadeAddition(child, combinedData, tomName, files);
			//if (!files[child] && (await pathExists(child))) {
			//	files[child] = await createNewFileData(child, combinedData, tomName);
			//}
		}

		for (const child of removedChildren) {
			await cascadeRemoval(child, files);
			//if (files[child]) {
			//	console.log(`deleting ${basename(child)}`);
			//	delete files[child];
			//}
		}
	}

	return new Promise((resolve, reject) => {
		try {
			resolve();
		} catch (e) {
			reject(e);
		}
	});
}

async function cascadeAddition(path, parentData, tomName, filesRef) {
	console.log(`Adding ${basename(path)} to tomData`);
	if (!filesRef[path] && (await pathExists(path))) {
		const fileData: FileData = await createNewFileData(path, parentData, tomName);
		filesRef[path] = fileData;

		if (fileData.isLanding && fileData.children) {
			const additionTasks = fileData.children.map((child) => cascadeAddition(child.href, fileData, tomName, filesRef));

			return await Promise.all(additionTasks);
		}
	}
}
async function cascadeRemoval(path, filesRef) {
	const fileData = filesRef[path];

	if (fileData) {
		const children = fileData.children ? [ ...fileData.children ] : null;
		console.log(`Deleting ${basename(path)} from tomData`);
		delete filesRef[path];

		if (children) {
			const removalTasks = children.map((child) => cascadeRemoval(child.href, filesRef));

			return await Promise.all(removalTasks);
		}
	}
}
