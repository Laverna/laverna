'use strict';

module.exports = function(gulp) {
    return function() {
        return gulp.src([
            './server.js',
            './package.json'
        ], {base: './'})
        .pipe(gulp.dest('./release/laverna'));
    };
};
