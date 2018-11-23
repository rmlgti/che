// @ts-check
const path = require('path');
const baseConfig = require('../webpack.config');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const yargs = require('yargs');
const { env: { cdn, monacocdn } }  = yargs.option('env.cdn', {
    description: "base URL of the CDN that will host theia files",
    type: "string",
    default: ''
}).option('env.monacocdn', {
    description: "base URL of the CDN that will host Monaco editor main files",
    type: "string",
    default: ''
}).argv;

module.exports = baseConfig;

module.exports.optimization = {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\/]node_modules[\/](?!@theia[\/])/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
};

module.exports.output.filename = '[name].[contenthash].js';
module.exports.plugins.unshift(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: 'customization/custom-html.html',
    inject: false,
    customparams: {
        cdnPrefix: cdn,
        monacoCdnPrefix: monacocdn
    }
}));
module.exports.plugins.unshift(new webpack.HashedModuleIdsPlugin());
module.exports.module.rules.filter((rule) => rule.loader && rule.loader.match(/(file-loader|url-loader)/))
.forEach((rule) => {
    const originalLoader = {
      loader: rule.loader
    };

    if (rule.options) {
      originalLoader["options"] = rule.options;
    }

    delete rule.options;
    delete rule.loader;
    rule.use = [
      {
        loader: path.resolve('customization/cdn-support.js'),
      },
      originalLoader
    ];
});
