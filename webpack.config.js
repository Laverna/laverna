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

    entry: {
        main   : path.join(__dirname, './app/scripts/main.js'),
        vendor : Object.keys(pkg.dependencies),
    },

    output: {
        path       : path.join(__dirname, './dist/scripts/'),
        publicPath : 'scripts/',
        filename   : '[name].js',
    },

    resolve: {
        alias: {
            modernizr: path.resolve(__dirname, '.modernizrrc'),
        },
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({names: ['vendor']}),

        new webpack.ProvidePlugin({
            _               : 'underscore',
            $               : 'jquery',
            jQuery          : 'jquery',
            'window.jQuery' : 'jquery',
            Modernizr       : 'modernizr',
        }),
    ],

    module: {
        rules: [
            // WebWorkers
            {
                test: /worker\.js$/,
                loader: 'worker-loader',
            },

            // Babel
            {
                test    : /\.js?$/,
                exclude : /(node_modules|bower_components)/,
                loader  : 'babel-loader',
                query   : {
                    presets: [['es2015', {modules: false}]],
                },
            },

            // Modernizr
            {
                test: /\.modernizrrc$/,
                loader: 'modernizr-loader!json-loader',
            },

            // Templates
            {
                test:  /\.html$/,
                loader: 'raw-loader',
            },
        ],
    },
};
