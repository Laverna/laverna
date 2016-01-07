'use strict';

/**
 * Tasks for cleaning up.
 */
module.exports = function(gulp, plugins) {
    return {
        dist: function() {
            return gulp.src('./dist', {read: false})
            .pipe(plugins.clean());
        },

        release: function() {
            return gulp.src('./release/*', {read: false})
            .pipe(plugins.clean());
        },
    };
};
