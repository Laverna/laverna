'use strict';

/**
 * Minify HTML files.
 */
module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src('./app/*.html')
        .pipe(plugins.replace('<html class="no-js">', '<html manifest="app.appcache" class="no-js">'))
        .pipe(plugins.minifyHtml({
            conditionals: true,
            spare       : true
        }))
        .pipe(gulp.dest('./dist'));
    };
};
