const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const webpack = require('webpack');
const path = require('path');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
	entry: './src/typescript/index.tsx',
	mode: 'production',
	resolve: {
		extensions: ['.js', '.json', '.ts', '.tsx'],
		symlinks: false,
	},
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    hot: true,
    stats: {
      colors: true,
    },
    open: true,
  },
	output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
		publicPath: '/',
    pathinfo: false,
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				loader: 'awesome-typescript-loader',
        include: path.resolve(__dirname, 'src/typescript'),
			},
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: 'source-map-loader',
        include: path.resolve(__dirname, 'src'),
			},
			{
				test: /\.scss$/,
        include: path.resolve(__dirname, 'src/sass'),
				use: [
					{
						loader: 'style-loader',
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: false,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: false,
						},
					},
				],
			},
		],
	},
	plugins: [
    new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			title: 'Home',
      template: './src/template/index.ejs',
      // alwaysWriteToDisk: true,
    }),
		// new HtmlWebpackHarddiskPlugin(),
		new HardSourceWebpackPlugin(),
	],
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			},
		},
	},
};
