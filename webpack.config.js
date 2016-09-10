'use strict';

/**
 * Webpack configuration file.
 *
 * @file
 */
const path  = require('path'),
    webpack = require('webpack'),
    pkg     = require('./package.json');

module.exports = {
    devtool: 'source-map',
    debug  : true,

    entry: {
        app    : path.join(__dirname, './app/scripts/main.js'),
        vendor : Object.keys(pkg.dependencies),
    },

    output: {
        path       : '/scripts/',
        publicPath : '/scripts/',
        filename   : 'main.js',
    },

    resolve: {
        alias: {
            modernizr: path.resolve(__dirname, '.modernizrrc'),
        },
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),

        new webpack.ProvidePlugin({
            _               : 'underscore',
            $               : 'jquery',
            jQuery          : 'jquery',
            'window.jQuery' : 'jquery',
        }),
    ],

    module: {
        loaders: [
            // WebWorkers
            {
                test: /worker\.js$/,
                loader: 'worker',
            },

            // Babel
            {
                test    : /\.js?$/,
                exclude : /(node_modules|bower_components)/,
                loader  : 'babel',
                query   : pkg.babel,
            },

            // Modernizr
            {
                test: /\.modernizrrc$/,
                loader: 'modernizr',
            },

            // Templates
            {
                test:  /\.html$/,
                loader: 'raw-loader',
            },

            // JSON
            {
                test: /\.json$/,
                loader: 'json',
            },
        ],
    },
};
