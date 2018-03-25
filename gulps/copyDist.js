'use strict';

module.exports = function(gulp) {
    return function() {
        return gulp.src([
            './dist',
        ], {base: './'})
        .pipe(gulp.dest('./release/laverna/dist'));
    };
};

