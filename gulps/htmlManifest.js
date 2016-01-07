'use strict';

/**
 * Generate HTML5 cache manifest file.
 */
module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src([
            'dist/**',
            '!dist/bower_components/MathJax/**'
        ], {base: './dist'})
        .pipe(plugins.manifest({
            hash         : true,
            preferOnline : true,
            network      : ['*'],
            filename     : 'app.appcache',
            exclude      : [
                'app.appcache',
                'dropbox.html'
            ],
            timestamp    : true,
            master       : ['index.html'],
            fallback     : ['/ 404.html']
        }))
        .pipe(gulp.dest('dist'));
    };
};
