'use strict';

/**
 * Webpack configuration file for production.
 *
 * @file
 */
const webpack = require('webpack'),
    config    = require('./webpack.config');

// Disable source maps
config.devtool = false;

config.plugins = config.plugins.concat([

    // Optimize chunk IDs
    new webpack.optimize.OccurrenceOrderPlugin(),

    // Minimize code
    new webpack.optimize.UglifyJsPlugin(),

    // Deduplicate libraries
    new webpack.optimize.DedupePlugin(),

]);

module.exports = config;
