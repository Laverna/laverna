'use strict';

var cordova = require('cordova-lib').cordova.raw,
    fs      = require('fs'),
    devip   = require('dev-ip');

module.exports = function(gulp, plug, pkg) {

    /**
     * Use livereload server when debugging.
     */
    function useServer() {
        return plug.replace(
            '<content src="index.html',
            '<content src="http://' + devip()[0] + ':' + (plug.util.env.port || 9000)
        );
    }

    gulp.task('mobile:clean', function() {
        return plug.del(['./cordova']);
    });

    gulp.task('mobile:copy', function() {
        return gulp.src([`${$.distDir}/**/*`], {base: ${$.distDir}})
        .pipe(gulp.dest('./cordova/www'));
    });

    gulp.task('mobile:config', function() {
        return gulp.src(['./app/config.xml'])
        .pipe(plug.replace('{{version}}', pkg.version))
        .pipe(!plug.util.env.dev ?  plug.util.noop() : useServer())
        .pipe(gulp.dest('./cordova'));
    });

    /**
     * Copy build.json in which one can store keystore configs.
     */
    gulp.task('mobile:buildConfig', function() {
        try {
            fs.statSync('./build.json');
            return gulp.src(['./build.json'])
            .pipe(gulp.dest('./cordova'));
        } catch (e) {
            return plug.util.noop();
        }
    });

    gulp.task('mobile:replace', function() {
        return gulp.src('./cordova/www/index.html')
        .pipe(plug.replace('<!-- {{cordova}} -->', '<script src="cordova.js"></script>'))
        .pipe(plug.replace(' manifest=\'app.appcache\'', ''))

        // Use different name for debugging
        .pipe(
            plug.util.env.dev ?
                plug.replace('<name>Laverna', '<name>Laverna dev') :
                plug.util.noop()
        )
        .pipe(gulp.dest('./cordova/www'));
    });

    gulp.task('mobile:cordova', function() {
        process.chdir('./cordova');

        return cordova.platform('add', ['android'])
        .then(function() {
            return cordova.plugins('add', [
                'cordova-plugin-crosswalk-webview',
                'cordova-plugin-inappbrowser',
                'cordova-plugin-file',
            ]);
        });
    });

    gulp.task('mobile:create', plug.sequence(
        'mobile:clean',
        'build',
        ['mobile:copy', 'mobile:config', 'mobile:buildConfig'],
        'mobile:replace',
        'mobile:cordova'
    ));

    gulp.task('mobile:build', ['mobile:create'], function() {
        return cordova.build({
            platforms: ['android'],
            options  : {
                release: !plug.util.env.dev
            }
        });
    });

};
