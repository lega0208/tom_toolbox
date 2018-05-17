
module.exports = {
	plugins: [
		require('autoprefixer'),
		require('cssnano')
	],
	parser: 'postcss-scss',
	syntax: require('postcss-scss')
};
