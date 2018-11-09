/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import MomentLocalesPlugin from 'moment-locales-webpack-plugin';
import { dependencies as externals } from './app/package.json';

export default {
  externals: Object.keys(externals || {}),

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    }]
  },

  output: {
    path: path.join(__dirname, 'app'),
    filename: 'renderer.dev.js',
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      path.join(__dirname, 'app'),
      'node_modules',
    ],
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
  },
  mode: JSON.stringify(process.env.NODE_ENV || 'production'),
  plugins: [
    new webpack.DefinePlugin({
      'global.GENTLY': false,
    }),

    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
			Util: 'exports-loader?Util!bootstrap/js/dist/util'
    }),
		new MomentLocalesPlugin(),
  ],
	// profile: true,
};
