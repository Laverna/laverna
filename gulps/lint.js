'use strict';

/**
 * @file Lint tasks.
 *
 * @example gulp eslint // JavaScript linter
 * @example gulp jsonlint // JSON linter
 */
module.exports = (gulp, $) => {
    gulp.task('eslint', $.shell.task(['npm run eslint']));

    gulp.task('jsonlint', () => {
        return gulp.src([
            'app/manifest.webapp',
            'bower.json',
            'package.json',
            'app/**/*.json',
        ])
        .pipe($.jsonlint())
        .pipe($.jsonlint.failAfterError())
        .pipe($.jsonlint.reporter());
    });
};
