'use strict';

/**
 * @file Tasks for cleaning up.
 * @example gulp clean:dist // Clean dist directory
 * @example gulp clean:release // Clean release directory
 */
module.exports = function(gulp, $) {

    gulp.task('clean:dist', () => $.del([`${$.distDir}/**/*`]));

    gulp.task('clean:release', () => $.del(['./release/*']));

};
