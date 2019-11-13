/*
 * CACHE types
 */
export const CACHE = {
	CHECK: 'CACHE.CHECK',
};

/*
 * Cache actions
 */

export const checkCache = (z) => ({ type: CACHE.CHECK, z });
