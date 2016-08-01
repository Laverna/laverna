'use strict';

/**
 * Minify CSS files.
 */
module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src('./app/styles/*.css')
        .pipe(plugins.cleanCss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./dist/styles'));
    };
};
