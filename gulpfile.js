'use strict';

/**
 * @file Gulp tasks.
 * @example gulp // Default task. Builds and serves the app.
 */
const gulp = require('gulp'),
    pkg    = require('./package.json'),
    $      = require('gulp-load-plugins')();

$.del         = require('del');
$.browserSync = require('browser-sync').create();

/**
 * Create a new Gulp task.
 *
 * @param {String} name - name of the task file
 */
function createTask(name) {
    const task = require(`./gulps/${name}`)(gulp, $, pkg);

    if (typeof task === 'function') {
        gulp.task(name, task);
    }
}

// Load and create tasks
[
    'bundle',
    'clean',
    'css',
    'html',
    'lint',
    'serve',
    'test',
].forEach(createTask);

gulp.task('release:after', () => {
    return gulp.src('./release')
    .pipe($.shell([
        'cd ./release && zip -r ../release/webapp.zip ./laverna',
    ]));
});

/**
 * Build the app.
 * ``gulp build --dev`` to build without minifying.
 */
gulp.task('build', $.sequence(
    'test',
    'clean:dist',
    ['prism', 'less'],
    ['copy', 'require', 'htmlmin', 'cssmin'],
    'htmlManifest'
));

/**
 * Prepare the release files.
 */
gulp.task('release', $.sequence(
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
gulp.task('default', $.sequence(
    'clean:dist',
    ['css', 'html', 'bundle'],
    ['serve']
));
