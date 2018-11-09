// @flow
import { outputJSON, readJSON, stat } from 'fs-extra';
import { updateCachedData } from './parse-file';
import { TOM_DATA_CACHE } from '@constants';

export type TOMData = {
	tomName: string,
	homePage: string, // without -[ef].html
	secMenu: Array<string>,
	files: { [FilePath]: FileData },
}
type FilePath = string;

type Nav = {
	prevPage?: string,
	homePage: string,
	nextPage?: string,
};

type ToCItem = { link: string, text: string };
type ToCLevel = Array<ToCItem>;

type Header = {
	tag: string,
	text: string,
	id?: string,
};

export type FileData = {
	path: string,
	depth: number, // basically how many parents they have, will be used to prioritize updates because they can cascade
	lastUpdated: number,
	isLanding: boolean,
	isHomepage?: boolean,
	title: {
		titleTag: string,
		metadata: string,
		h1: string,
	},
	date: {
		top: ?string,
		bottom: ?string,
	},
	langLink: string,
	breadcrumbs: {
		expected: Array<string>,
		actual: Array<string>,
	},
	secMenu: Array<string>,
	nav?: {
		top: ?Nav,
		bottom: ?Nav,
	},
	toc?: Array<ToCLevel>,
	headers?: Array<Header>,
	parent?: string,
	children?: ?Array<string>,
}

export default async function getTOMData(tomName) {
	const dataFilePath = join(TOM_DATA_CACHE, `${tomName}.json`);
	const tomData: TOMData = await readJSON(dataFilePath);
	const { files } = tomData;
	const outdatedFiles = [];

	// do check on homePage if children changed

	// do checks on all landing pages for new children (diff file paths)
	//  check if they exist, and if not, add them

	for (const { path, lastUpdated } of Object.values(files)) {
		const lastModified = (await stat(path)).mtime;

		if (lastModified > lastUpdated) {
			outdatedFiles.push(path);
		}
	}

	if (outdatedFiles.length > 0) {
		const sortedFiles = outdatedFiles.sort((path, nextPath) => files[path].depth - files[nextPath].depth); // sort according to depth
		const landingPages = await readJSON('./landing-pages.json');

		for (const path of sortedFiles) {
			files[path] = await updateCachedData(path, tomData, landingPages); // make sure this actually mutates tomData
		}

		await outputJSON(dataFilePath, tomData);
	}

	return tomData;
}
