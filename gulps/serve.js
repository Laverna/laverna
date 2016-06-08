'use strict';

/**
 * Live reload server.
 */
module.exports = function(gulp, plugins) {
    return {
        html: function() {
            return gulp.task('reload:html', function() {
                return gulp.src('./app/*.html')
                .pipe(plugins.connect.reload());
            });
        },

        less: function() {
            return gulp.task('reload:less', ['less'], function() {
                return gulp.src('./app/styles/**/*.css')
                .pipe(plugins.connect.reload());
            });
        },

        js: function() {
            return gulp.task('reload:js', function() {
                return gulp.src('./app/**/*.js')
                .pipe(plugins.connect.reload());
            });
        },

        server: function() {
            plugins.connect.server({
                port       : (plugins.util.env.port || 9000),
                root       : (plugins.util.env.root || 'app'),
                livereload : true
            });

            gulp.watch('app/**/*.html', ['reload:html']);
            gulp.watch('app/**/*.js', ['reload:js']);
            gulp.watch(['app/styles/**/*.less'], ['reload:less']);
        },
    };
};
