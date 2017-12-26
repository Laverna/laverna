'use strict';

module.exports = function(gulp, $) {
    return function() {
        return gulp.src($.distDir)
        .pipe($.shell([
            'mkdir -p ./release/laverna',
            `cp -R ${$.distDir} ./release/laverna/dist`,
        ]));
    };
};
