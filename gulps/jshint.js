'use strict';

module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src([
            './app/scripts/**/*.js',
            './app/scripts/*.js'
        ])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.jshint.reporter('fail'));
    };
};
