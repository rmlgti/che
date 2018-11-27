// @ts-check
const path = require('path');
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

// Retrieve the default, generated, Theia Webpack configuration
const baseConfig = require('../webpack.config');

// Add the cdn-support.js file at the beginning of the entries.
// It contains the logic to load various types of files from the configured CDN
// if available, or fallback to the local file
const originalEntry = baseConfig.entry;
baseConfig.entry = {
    "cdn-support": path.resolve(__dirname, 'cdn-support.js'),
    "main": originalEntry
};

// Include the content hash to enable long-term caching
baseConfig.output.filename = '[name].[contenthash].js';

// Separate the webpack runtime module, theia modules, external vendor modules
// in 3 distinct chhunks to optimize caching management
baseConfig.optimization = {
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

// Use hashed module IDs to ease caching support
// and avoid the hash-based chunk names being changed
// unexpectedly
baseConfig.plugins.push(new webpack.HashedModuleIdsPlugin());

// Use our own HTML template to trigger the CDN-supporting
// logic, with the CDN prefixes passed as env parameters
baseConfig.plugins.unshift(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: 'customization/custom-html.html',
    inject: false,
    customparams: {
        cdnPrefix: cdn,
        monacoCdnPrefix: monacocdn
    }
}));

// Insert a custom loader to override file and url loaders,
// in order to insert CDN-related logic
baseConfig.module.rules.filter((rule) => rule.loader && rule.loader.match(/(file-loader|url-loader)/))
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

// Export the customized webpack configuration object
module.exports = baseConfig;