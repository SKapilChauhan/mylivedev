/* config-overrides.js */

const HtmlWebpackPlugin = require('html-webpack-plugin');

var webpack = require('webpack');

const path = require("path");

const rewireCssModules = require('react-app-rewire-css-modules');

const dotenv = require('dotenv');

function resolve(dir) {
    return path.join(__dirname, '.', dir)
}

module.exports = function override(config, env) {

	//编译的版本production（正式)、development(本地)
	let environment = process.argv.splice(2)[0] || 'development';

	config.devtool = false;

	config.resolve.alias.appSrcs = resolve('src');

	/*加载.env文件到process.env*/
	// call dotenv and it will return an Object with a parsed key 
	
	let env_path = environment == 'production' ? '/.proenv' : '/.env';

	const envconfig = dotenv.config({path: __dirname + env_path}).parsed;
	  
	// reduce it to a nice object, the same as before
	const envKeys = Object.keys(envconfig).reduce((prev, next) => {
		prev[`process.env.${next}`] = JSON.stringify(envconfig[next]);
		return prev;
	}, {});

	if(env_path == 'production'){
		config.devtool = false;
	} else {
		config.devtool = 'source-map';
	}

	let envPlugin = new webpack.DefinePlugin(envKeys);

	config.plugins.push(envPlugin);

	if(environment == 'production'){
		//编译线上
		config.output.path = resolve('app');
	} else {
		//编译本地
		config.output.path = resolve('build');
	}
	//css-modules
	config = rewireCssModules(config, env);
	return config;
}