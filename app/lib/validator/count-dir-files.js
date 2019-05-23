import { readdir, stat } from 'fs-extra';
import { join, dirname } from 'path';


const recurseDir = async (dir, totalFiles = 0) => {
	const items = (await readdir(dir)).map((item) => join(dir, item));
	const numFiles =
		items.filter(async (item) => (await stat(item)).isFile())
			.length;

	const sum = totalFiles + numFiles;

	const skipRegex = /images|archive|old|pdf/i;

	return items
		.reduce(
			async (accP, item) => (
				((await stat(item)).isDirectory() && !skipRegex.test(item))
					? await recurseDir(item, await accP)
					: await accP
			),
			Promise.resolve(sum),
		);
};

export default async function countDirFiles(dir) {
	return await recurseDir(dirname(dir));
}