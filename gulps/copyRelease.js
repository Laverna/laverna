'use strict';

module.exports = function(gulp) {
    return function() {
        return gulp.src([
            './preload.js',
            './server.js',
            './package.json'
        ], {base: './'})
        .pipe(gulp.dest('./release/laverna'));
    };
};
