/**
 * Build config for electron renderer process
 */

import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import merge from 'webpack-merge';
//import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import baseConfig from './webpack.config.base';
import CheckNodeEnv from './internals/scripts/CheckNodeEnv';
//import CopyPlugin from 'copy-webpack-plugin';

CheckNodeEnv('production');

export default merge.smart(baseConfig, {
	mode: 'production',
  devtool: 'source-map',
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					parse: {
						ecma: 8,
					},
					output: {
						beautify: false,
						ecma: 5,
					},
				},
				cache: true,
				sourceMap: true, // set to true if you want JS source maps
				parallel: true,
			}),
			new OptimizeCSSAssetsPlugin({})
		]
	},
	target: 'electron-renderer',
  entry: './app/index',

  output: {
    path: path.join(__dirname, 'app/dist'),
    publicPath: './dist/',
    filename: 'renderer.prod.js',
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
	        MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
	        {
		        loader: 'css-loader',
		        options: {
			        modules: true,
			        importLoaders: 1,
			        localIdentName: '[name]__[local]__[hash:base64:5]',
		        }
	        }
        ],
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
	        {
		        loader: 'css-loader',
		        options: {
			        sourceMap: true,
			        importLoaders: 2,
			        alias: {
				        '../node_modules/bootstrap/scss': 'bootstrap'
			        }
		        },
	        },
	        {
		        loader: 'postcss-loader'
	        },
	        {
		        loader: 'sass-loader'
	        }
        ]
      },
      // Add SASS support  - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]',
            }
          },
	        {
		        loader: 'sass-loader'
	        }
        ],
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          }
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          }
        }
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          }
        }
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      }
    ]
  },
  plugins: [
  	new MiniCssExtractPlugin({
		  filename: 'style.css',
		  chunkFile: '[id].css',
	  }),
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    // }),

    /**
     * Babli is an ES6+ aware minifier based on the Babel toolchain (beta)
     */
    // new BabiliPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
});
