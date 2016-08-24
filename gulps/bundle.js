'use strict';

const webpackStream = require('webpack-stream');

/**
 * @file Bundle JS files.
 * @example gulp bundle // Bundle JS files
 * @example gulp bundle --prod // Bundle JS for production (minify, uglify)
 * @returns {Function}
 */
module.exports = (gulp, $) => {

    // Use a different config file for production
    let webpackConfig = ($.util.env.prod ? 'production.config' : 'config.js');
    webpackConfig     = require(`../webpack.${webpackConfig}`);

    return cb => {
        const isBuild = process.argv[2] === 'build';
        let called    = false;

        // Watch for changes unless we're building the project
        if (!isBuild) {
            webpackConfig.watch = true;
        }

        return gulp.src('app/scripts/main.js')
        .pipe(webpackStream(webpackConfig, null, () => {
            $.browserSync.stream();

            if (!called && !isBuild) {
                called = true;
                cb();
            }
        }))
        .pipe(gulp.dest('dist/scripts/'))
        .pipe($.browserSync.stream());
    };
};
