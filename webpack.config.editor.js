/**
 * For resolving aliases with Webstorm
 */
const path = require('path');

module.exports = {
	resolve: {
		alias: {
			'@fortawesome/fontawesome-free-solid$':
				path.resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free-solid/shakable.es.js'),
			'@fortawesome/fontawesome-free-regular$':
				path.resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free-regular/shakable.es.js'),
			actions: path.resolve(__dirname, 'app/actions'),
			components: path.resolve(__dirname, 'app/components'),
			bsComponents: path.resolve(__dirname, 'app/components/bsComponents.js'),
			containers: path.resolve(__dirname, 'app/containers'),
			database: path.resolve(__dirname, 'app/database'),
			lib: path.resolve(__dirname, 'app/lib'),
			reducers: path.resolve(__dirname, 'app/reducers'),
			utils: path.resolve(__dirname, 'app/utils'),
			'@constants': path.resolve(__dirname, 'app/constants.js'),
		},
	}
};
