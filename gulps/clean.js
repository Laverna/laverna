'use strict';

/**
 * @file Tasks for cleaning up.
 * @example gulp clean:dist // Clean dist directory
 * @example gulp clean:release // Clean release directory
 */
module.exports = function(gulp, plugins) {

    gulp.task('clean:dist', () => plugins.del(['./dist']));

    gulp.task('clean:release', () => plugins.del(['./release/*']));

};
