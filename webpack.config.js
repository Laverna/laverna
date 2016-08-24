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
        path       : path.join(__dirname, 'dist/scripts'),
        publicPath : path.join(__dirname, 'dist'),
        filename   : 'main.js',
    },

    resolve: {
        alias: {
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
            // Babel
            {
                test    : /\.js?$/,
                exclude : /(node_modules|bower_components)/,
                loader  : 'babel',
                query   : pkg.babel,
            },

            // Templates
            {
                test:  /\.html$/,
                loader: 'raw-loader',
            },
        ],
    },
};
