import { stat } from 'fs-extra';
import { DISTRIB_PATH } from '../../constants';

const dbPath = `${DISTRIB_PATH}PagesDB.accdb`;
export default async function getPathsLastUpdated() {
	try {
		return (await stat(dbPath)).mtime;
	} catch (e) {
		console.error(e);
		throw e;
	}
}
