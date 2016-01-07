'use strict';

module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src([
            'app/manifest.webapp',
            'bower.json',
            'package.json',
            'app/**/*.json'
        ])
        .pipe(plugins.jsonlint())
        .pipe(plugins.jsonlint.failAfterError())
        .pipe(plugins.jsonlint.reporter());
    };
};
