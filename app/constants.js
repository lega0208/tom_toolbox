/**
 * Various constants used throughout the project
 */
import path from 'path';

export const APP_DIR = path.join(`${process.env.USERPROFILE}/`, 'TOM_Toolbox');

export const DB_PATH = path.join(APP_DIR, '.dbpath');
export const LAST_CACHE = path.join(APP_DIR, '.lastCache');
export const CACHE_FILE = path.join(APP_DIR, 'cache.db');
export const DEFAULT_DB_PATH =
	'\\\\OMEGA\\NATDFS\\CRA\\HQ\\ABSB\\ABSB_H0E\\GV1\\IRD\\SPCI\\DIRECTORATE_SERVICES\\TOM_online\\HELP\\AcroDB.accdb';