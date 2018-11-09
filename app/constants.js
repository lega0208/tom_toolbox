/**
 * Various constants used throughout the project
 */
import { join } from 'path';

// Installation directory
export const APP_DIR = join(`${process.env.USERPROFILE}/`, 'TOM_Toolbox');

const inAppDir = (basename) => join(APP_DIR, basename);

export const DEFAULT_DB_PATH =
	'\\\\OMEGA\\NATDFS\\CRA\\HQ\\ABSB\\ABSB_H0E\\'
	+ 'GV1\\IRD\\SPCI\\DIRECTORATE_SERVICES\\TOM_online\\HELP\\AcroDB.accdb';
export const DB_PATH = inAppDir('.dbpath');
export const DB_DRIVER_PATH = inAppDir('.dbdriver');
export const DB_DRIVER = 'Ace.OLEDB.12';
export const DB_DRIVER_ALT = 'Jet.OLEDB.4';
export const LAST_CACHE = inAppDir('.lastCache');
export const CACHE_FILE = inAppDir('cache.db');
export const TOM_DATA_CACHE = inAppDir('TOM_Data');