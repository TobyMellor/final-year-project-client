const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: {
    main: [
      'webpack-hot-middleware/client',
      './src/typescript/index.tsx',
    ],
  },
	resolve: {
		extensions: ['.js', '.json', '.ts', '.tsx'],
	},
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    overlay: true,
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
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				loader: 'awesome-typescript-loader',
			},
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: 'source-map-loader',
			},
			{
				test: /\.scss$/,
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
      alwaysWriteToDisk: true,
    }),
    new HtmlWebpackHarddiskPlugin(),
	],
};
