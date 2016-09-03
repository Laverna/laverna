'use strict';

/**
 * Live reload server.
 */
module.exports = function(gulp, plugins) {

    gulp.task('serve:watch', function() {
        // Compile LESS files
        gulp.watch('app/styles/**/*.less', ['less']);

        gulp.watch([
            'app/**/*.html',
            'app/scripts/**/*.js',
            'app/locales/**/*.json',
        ]).on('change', plugins.browserSync.reload);
    });

    gulp.task('serve:start', function() {
        return plugins.browserSync.init({
            server : (plugins.util.env.root || 'app'),
            port   : (plugins.util.env.port || 9000),
        });
    });

};
