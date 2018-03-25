'use strict';

const path = require('path');

/**
 * @file Create CSS related Gulp tasks.
 *
 * @example gulp css // bundle CSS files
 * @example gulp cssmin // minify CSS for production
 */
module.exports = (gulp, $) => {

    gulp.task('css', () => {
        return gulp.src('./app/styles/*/main.less')
        .pipe($.less({
            paths: [
                path.join(__dirname, 'less', 'includes'),
                './node_modules/',
            ],
        }))
        // Unique names for theme files
        .pipe($.rename(pathF => {
            const pathNew    = pathF;
            pathNew.basename = pathNew.dirname;
            pathNew.dirname  = '';
            return pathNew;
        }))
        // Autoprefixer
        .pipe($.autoprefixer({
            browsers : ['> 5%'],
            cascade  : false,
            remove   : false,
            add      : true,
        }))
        .pipe(gulp.dest(`${$.distDir}/styles/`))
        .pipe($.browserSync.stream());
    });

    gulp.task('cssmin', () => {
        return gulp.src(`${$.distDir}/styles/*.css`)
        .pipe($.cleanCss({
            compatibility: 'ie8',
        }))
        .pipe(gulp.dest(`${$.distDir}/styles`));
    });

};
