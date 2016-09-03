'use strict';
var gulp    = require('gulp'),
    pkg     = require('./package.json'),
    plugins = require('gulp-load-plugins')();

plugins.del         = require('del');
plugins.browserSync = require('browser-sync').create();

function getTask(task) {
    return require('./gulps/' + task)(gulp, plugins, pkg);
}

// Add Gulp tasks
[
    'jshint' , 'jsonlint'   , 'mocha'       , 'nightwatch',
    'less'   , 'prism'      , 'require'     , 'electron'  ,
    'htmlmin', 'cssmin'     , 'htmlManifest', 'mobile'    ,
    'copy'   , 'copyRelease', 'copyDist'    ,
    'serve'  , 'clean'      , 'npm'
]
.forEach(function(task) {
    var taskFun = getTask(task);

    // It has several tasks
    if (typeof taskFun === 'function') {
        gulp.task(task, taskFun);
    }
});

gulp.task('release:after', function() {
    return gulp.src('./release')
    .pipe(plugins.shell([
        'cd ./release && zip -r ../release/webapp.zip ./laverna',
    ]));
});

/**
 * Unit tests.
 */
gulp.task('test', ['jsonlint', 'jshint', 'mocha']);

/**
 * Build the app.
 * ``gulp build --dev`` to build without minifying.
 */
gulp.task('build', plugins.sequence(
    'test',
    'clean:dist',
    ['prism', 'less'],
    ['copy', 'require', 'htmlmin', 'cssmin'],
    'htmlManifest'
));

/**
 * Prepare the release files.
 */
gulp.task('release', plugins.sequence(
    'build',
    'clean:release',
    ['copyDist', 'copyRelease'],
    'npm:install',
    'electron',
    'release:after'
));

/**
 * Gulp server.
 * ``gulp --root dist`` to serve dist folder.
 */
gulp.task('default', plugins.sequence(
    ['less', 'prism'],
    ['serve:start', 'serve:watch']
));
