'use strict';
var path = require('path');

module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src('./app/styles/*/main.less')
        .pipe(plugins.less({
            paths: [
                path.join(__dirname, 'less', 'includes'),
                './app/bower_components/'
            ]
        }))
        // Unique names for theme files
        .pipe(plugins.rename(function(path) {
            path.basename = path.dirname;
            path.dirname  = '';
            return path;
        }))
        // Autoprefixer
        .pipe(plugins.autoprefixer({
            browsers : ['> 5%'],
            cascade  : false,
            remove   : false,
            add      : true
        }))
        .pipe(gulp.dest('./app/styles/'))
        .pipe(plugins.browserSync.stream());
    };
};
