'use strict';
const merge = require('merge-stream');

/**
 * @file Tasks for copying static files to dist directory.
 * @example gulp copy // Copy static files
 */
module.exports = gulp => {
    return () => {
        return merge.apply(merge, [
            gulp.src([
                './LICENSE',
            ], {base: './'})
            .pipe(gulp.dest('./dist')),

            // Copy static files like images, locales, etc...
            gulp.src([
                './app/images/**/*.+(png|jpg|gif|ico|icns)',
                './app/docs/**',
                './app/locales/**/*.json',
                './app/.htaccess',
                './app/*.+(xml|ico|txt|webapp)',
                './app/styles/**/*.+(eot|svg|ttf|woff)',
            ], {base: './app'})
            .pipe(gulp.dest('./dist')),
        ]);
    };
};
