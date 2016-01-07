'use strict';

module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src('./dist')
        .pipe(plugins.shell([
            'mkdir -p ./release/laverna',
            'cp -R ./dist ./release/laverna/dist',
        ]));
    };
};
