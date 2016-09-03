'use strict';

module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src('./test/index.html')
        .pipe(plugins.mochaPhantomjs())
        .once('error', function(err) {
            console.log('Error', err.toString());
            process.exit(1);
        });
    };
};
