'use strict';

/**
 * Tasks for cleaning up.
 */
module.exports = function(gulp, plugins) {

    gulp.task('clean:dist', function() {
        return plugins.del(['./dist']);
    });

    gulp.task('clean:release', function() {
        return plugins.del(['./release/*']);
    });

};
