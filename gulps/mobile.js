'use strict';

var cordova = require('cordova-lib').cordova.raw;

module.exports = function(gulp, plugins, pkg) {

    gulp.task('mobile:clean', function() {
        return plugins.del(['./cordova']);
    });

    gulp.task('mobile:copy', function() {
        return gulp.src(['./dist/**/*'], {base: 'dist'})
        .pipe(gulp.dest('./cordova/www'));
    });

    gulp.task('mobile:config', function() {
        return gulp.src(['./app/config.xml'])
        .pipe(plugins.replace('{{version}}', pkg.version))
        .pipe(gulp.dest('./cordova'));
    });

    gulp.task('mobile:replace', function() {
        return gulp.src('./cordova/www/index.html')
        .pipe(plugins.replace('<!-- {{cordova}} -->', '<script src="cordova.js"></script>'))
        .pipe(plugins.replace(' manifest=\'app.appcache\'', ''))
        .pipe(gulp.dest('./cordova/www'));
    });

    gulp.task('mobile:cordova', function() {
        process.chdir('./cordova');

        return cordova.platform('add', ['android'])
        .then(function() {
            return cordova.plugins('add', [
                'cordova-plugin-crosswalk-webview',
                'cordova-plugin-inappbrowser',
            ]);
        });
    });

    gulp.task('mobile:create', plugins.sequence(
        'mobile:clean',
        'build',
        ['mobile:copy', 'mobile:config'],
        'mobile:replace',
        'mobile:cordova'
    ));

    gulp.task('mobile:build', ['mobile:create'], function() {
        return cordova.build({
            platforms: ['android'],
            options  : {
                // argv : ['--release']
            }
        });
    });

};
