const webpack = require("webpack");
const ErrFmt = require("friendly-errors-webpack-plugin");
const { webpackMock } = require("./browser");
const iniConfig = require("./webpack.ini");
const {
	dir, staticFolder, styleLoader,
	cssStyleLoader, cssModuleLoader,
	scssStyleLoader, lessStyleLoader,
} = iniConfig;

const developmentConfig = {
	// devtool: "eval-source-map",
	devtool: "cheap-module-eval-source-map",
	module: {
		rules: [
			{
				test: /\.css(\?.*)?$/i,
				oneOf: [{
					resourceQuery: /\bmodule\b/i,
					use: [
						styleLoader,
						cssModuleLoader,
						"postcss-loader",
					],
				}, {
					use: [
						styleLoader,
						cssStyleLoader,
						"postcss-loader",
					],
				}],
			},
			{
				test: /\.less(\?.*)?$/i,
				oneOf: [{
					resourceQuery: /\bmodule\b/i,
					use: [
						styleLoader,
						cssModuleLoader,
						"postcss-loader",
						lessStyleLoader,
					],
				}, {
					use: [
						styleLoader,
						cssStyleLoader,
						"postcss-loader",
						lessStyleLoader,
					],
				}],
			},
			{
				test: /\.scss(\?.*)?$/i,
				oneOf: [{
					resourceQuery: /\bmodule\b/i,
					use: [
						styleLoader,
						cssModuleLoader,
						"postcss-loader",
						scssStyleLoader,
					],
				}, {
					use: [
						styleLoader,
						cssStyleLoader,
						"postcss-loader",
						scssStyleLoader,
					],
				}],
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("development"),
			},
		}),
		new ErrFmt(),
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	],
	devServer: {
		historyApiFallback: true,
		watchContentBase: true,
		disableHostCheck: true,
		compress: true,
		hotOnly: true,
		noInfo: true,
		inline: !iniConfig.ie,
		// ie11以下不支持inline,热重载inline必须为true
		https: false,
		quiet: false,
		open: false,
		hot: true,
		port: 8888,
		host: "0.0.0.0",
		publicPath: "/",
		clientLogLevel: "error",
		proxy: iniConfig.html.proxy,
		contentBase: dir(staticFolder),
		// webpack1使用setup webpack3使用before
		[iniConfig.c("webpack") < 3 ? "setup" : "before"]:
			app => webpackMock(app, "src/mock"),
	},
};

module.exports = developmentConfig;