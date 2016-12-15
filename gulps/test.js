'use strict';

/**
 * @file Test related tasks.
 * @example gulp tape // Run Unit tests once
 * @example gulp test:run // Run Unit tests and linters once
 * @example gulp test // Run Unit tests and watch for changes
 * @example gulp cover:run // Generate coverage report once
 * @example gulp cover // Generate coverage report and watch for changes
 * @todo enable lint tests
 */
module.exports = function(gulp, $) {

    gulp.task('tape', $.shell.task([
        'babel-node ./test/tape/index.js | faucet',
    ]));

    gulp.task('tape:debug', $.shell.task([
        'export TAP_DIAG=1 && babel-node ./test/tape/index.js',
    ]));

    gulp.task('test:run', ['lint', 'tape']);

    gulp.task('test', ['test:run'], () => {
        gulp.watch(['app/scripts/**/*.js', 'test/tape/**/*.js'], ['tape']);
    });

    gulp.task('cover:run', $.shell.task(['npm run cover']));
    gulp.task('cover', ['cover:run'], () => {
        gulp.watch(['app/scripts/**/*.js', 'test/tape/**/*.js'], ['cover:run']);
    });

};
