/**
 * Various constants used throughout the project
 */
import path from 'path';

export const APP_DIR = path.join(`${process.env.USERPROFILE}/`, 'TOM_Toolbox');

export const DB_PATH = path.join(APP_DIR, '.dbpath');
export const LAST_CACHE = path.join(APP_DIR, '.lastCache');
export const CACHE_FILE = path.join(APP_DIR, 'cache.db');