import moment from 'moment';
import fs from "fs-extra";
import { CACHE_FILE, LAST_CACHE, TOM_DATA_CACHE, DB_PATH } from '../constants';

export function formatDate(datetime) {
	return moment(datetime).format('YYYY-MM-DD hh:mm:ss A');
}

export function clearCache() {
	const electron = process.type === 'renderer' ? require('electron').remote : require('electron');
	const currentWindow = electron.BrowserWindow.getAllWindows()[0];
	const session = currentWindow.webContents.session;

	fs.unlinkSync(CACHE_FILE, '', 'utf-8');
	fs.writeFileSync(LAST_CACHE, '', 'utf-8');
	fs.emptyDirSync(TOM_DATA_CACHE);
	fs.unlinkSync(DB_PATH);

	session.clearStorageData({ storages: ['localStorage'] });

	currentWindow.reload();
}
