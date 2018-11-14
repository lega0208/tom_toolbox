import { basename } from "path";
import { readFile } from "fs-extra";
import { wrapContent } from 'lib/validator/util';
import cheerio from "cheerio";
import { FileData, TOMData } from 'lib/validator/get-tom-data';
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
} from 'lib/validator/parse-file';

const parseNewData = async (path, parentData, tomName) => {
	const fileName = basename(path);
	const fileContents = await readFile(filePath, 'utf8');
	const pageContents = (await wrapContent(fileContents, fileName) || fileContents);
	const $ = cheerio.load(pageContents, { decodeEntities: false });

	return {
		lastUpdated: Date.now(),
		title: await getTitles($),
		date: await getDates($),
		langLink: await getlangLink($),
		breadcrumbs: await getBreadcrumbs($, path, parentData),
		secMenu: await getSecMenu($),
		nav: await getNavs($),
		toc: await getToC($),
		headers: await getHeaders($),
		children: await getChildren($, path, tomName),
	}
};

const createNewFileData = async (path, parentData, tomName) => ({
	path,
	depth: parentData.depth + 1,
	isLanding: false,
	parent: parentData.path,
	...(await parseNewData(path, parentData, tomName)),
});

export async function updateCachedData(path: string, tomData: TOMData): Promise<FileData> {
	const { files, tomName, secMenu } = tomData;

	const oldFileData: FileData = files[path];
	const parentData: ?FileData = oldFileData.parent ? files[oldFileData.parent] : null;

	const newFileData = await parseNewData(path, parentData, tomName);

	const combinedData: FileData = { ...oldFileData, ...newFileData };

	if (oldFileData.isLanding) {
		// check that each href was in the old children
		//  if not, check if the file existed in the tomData, and if not, parse and add the file to tomData.files
		const oldChildren = oldFileData.children;
		const newChildren = newFileData.children;

		if (oldFileData.isHomepage) {
			const oldHomepageChildren = oldChildren.map(({ href, text }) => [ href, text ]);
			const newHomepageChildren = newChildren.map(({ href, text }) => [ href, text ]);

			for (const [ i, oldChild ] of Object.entries(oldHomepageChildren)) {
				if (oldChild.text !== newHomepageChildren[i].text || oldChild.href !== newHomepageChildren[i].href) {
					const langRegex = /-([ef])\.html/;
					const lang = langRegex.exec(path)[1];
					secMenu[lang] = newChildren;
					break; //  exit the loop if any change is found
				}
			}
		}

		const addedChildren = newChildren
			.map((child) => child.href)
			.filter((child) => !oldChildren.includes(child));
		const removedChildren = oldChildren
			.map((child) => child.href)
			.filter((child) => !newChildren.includes(child));

		for (const child of addedChildren) {
			if (!files[child]) {
				files[child] = await createNewFileData(child, combinedData, tomName);
			}
		}

		for (const child of removedChildren) {
			if (files[child]) {
				delete files[child];
			}
		}

		if (oldFileData.isHomepage) {
			// if children changed, update tomData secMenu
			const childrenChanged = oldChildren.reduce((acc, child, i) => newChildren[i] !== child ? true : acc, false);
			if (childrenChanged) {
				// do the things here
			}
		}
	}

	return combinedData;
}