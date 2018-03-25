'use strict';

/**
 * @file Create HTML related tasks.
 *
 * @example gulp html // copy and minify HTML files
 * @example gulp html:manifest:create // create HTML manifest file (caching)
 * @example gulp:manifest // create manifest and reference to it from files
 */
module.exports = function(gulp, $) {
    gulp.task('html', () => {
        return gulp.src('./app/*.html')
        .pipe(!$.util.env.prod ? $.util.noop() : $.htmlmin({
            collapseWhitespace : true,
            quoteCharacter     : '\'',
        }))
        .pipe(gulp.dest($.distDir))
        .pipe($.browserSync.stream());
    });

    gulp.task('html:manifest:create', () => {
        // Don't generate manifest for Electron app
        if ($.util.env.electron) {
            return $.util.noop();
        }

        return gulp.src([
            `${$.distDir}/**`,
            `!${$.distDir}/bower_components/MathJax/**`,
        ])
        .pipe($.manifest({
            hash         : true,
            preferOnline : true,
            network      : ['*'],
            filename     : 'app.appcache',
            exclude      : [
                'app.appcache',
                'dropbox.html',
            ],
            timestamp    : true,
            master       : ['index.html'],
            fallback     : ['/ 404.html'],
        }))
        .pipe(gulp.dest($.distDir));
    });

    gulp.task('html:manifest', ['html:manifest:create'], () => {
        const htmlStr  = '<html class="no-js">';
        const manifest = '<html manifest="app.appcache" class="no-js">';

        return gulp.src(`${$.distDir}/*.html`)
        .pipe($.util.env.electron ? $.util.noop() : $.replace(htmlStr, manifest))
        .pipe(gulp.dest($.distDir));
    });
};
