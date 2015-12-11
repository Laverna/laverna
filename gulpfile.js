'use strict';
var gulp         = require('gulp'),
    util         = require('gulp-util'),
    connect      = require('gulp-connect'),
    path         = require('path'),
    less         = require('gulp-less'),
    rename       = require('gulp-rename'),
    aprefix      = require('gulp-autoprefixer'),
    // concat    = require('gulp-concat'),
    rjs          = require('gulp-requirejs-optimize'),
    merge        = require('merge-stream'),
    uglify       = require('gulp-uglify'),
    clean        = require('gulp-clean'),
    replace      = require('gulp-replace'),
    manifest     = require('gulp-manifest'),
    htmlmin      = require('gulp-minify-html'),
    cssmin       = require('gulp-minify-css'),
    pkg          = require('./package.json'),

    // Electron
    electron     = require('gulp-electron'),

    // Testing libraries
    jshint       = require('gulp-jshint'),
    jsonlint     = require('gulp-jsonlint'),
    mocha        = require('gulp-mocha-phantomjs'),
    nightwatch   = require('gulp-nightwatch');

/**
 * Server for dist folder.
 */
gulp.task('server:dist', function() {
    connect.server({
        port: 9000,
        root: 'dist',
        livereload: false
    });
});

/**
 * -------------------------------------
 * Livereload.
 * -------------------------------------
 */
gulp.task('reload:html', function() {
    return gulp.src('./app/*.html')
    .pipe(connect.reload());
});

gulp.task('reload:js', function() {
    return gulp.src('./app/**/*.js')
    .pipe(connect.reload());
});

gulp.task('default', ['less'], function() {
    connect.server({
        port: 9000,
        root: 'app',
        livereload: true
    });

    gulp.watch('app/**/*.html', ['reload:html']);
    gulp.watch('app/**/*.js', ['reload:js']);
    gulp.watch(['app/styles/**/*.less'], ['less']);
});

/**
 * ---------------------
 * Run tests.
 * ---------------------
 */
gulp.task('jshint', function() {
    return gulp.src(['./app/scripts/**/*.js',
                     './app/scripts/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jsonlint', function() {
    return gulp.src([
        'app/manifest.webapp',
        'bower.json',
        'package.json',
        'app/**/*.json'
    ])
    .pipe(jsonlint())
    .pipe(jsonlint.failAfterError())
    .pipe(jsonlint.reporter());
});

/**
 * Run unit tests.
 */
gulp.task('mocha', ['jshint', 'jsonlint'], function() {
    return gulp.src('./test/index.html')
    .pipe(mocha({
    }))
    .once('error', function(err) {
        console.log('Error', err.toString());
        process.exit(1);
    });
});

/**
 * Run UI tests.
 * Example of running tests:
 * gulp nightwatch --env [test_settings profile]
 */
gulp.task('nightwatch', function() {
    return gulp.src('./test/spec-ui/test.js', {read: false})
    .pipe(nightwatch({
        configFile : './test/nightwatch.json',
        cliArgs    : [
            // '--test ' + 'test/spec-ui/test.js',
            '--env ' + (util.env.env || 'default')
        ]
    }))
    .once('error', function(err) {
        console.log('Error', err.toString());
        process.exit(1);
    });
});

gulp.task('test', ['jshint', 'mocha'], function() {
    return;
});

/**
 * -------------------------------------
 * Compile, minify, and build everything.
 * -------------------------------------
 */
/**
 * Build and autoprefix LESS.
 */
gulp.task('less', function() {
    return gulp.src('./app/styles/*/main.less')
    .pipe(less({
        paths: [
            path.join(__dirname, 'less', 'includes'),
            './app/bower_components/'
        ]
    }))
    // Unique names for theme files
    .pipe(rename(function(path) {
        path.basename = path.dirname;
        path.dirname  = '';
        return path;
    }))
    // Autoprefixer
    .pipe(aprefix({
        browsers : ['> 5%'],
        cascade  : false,
        remove   : false,
        add      : true
    }))
    .pipe(gulp.dest('./app/styles/'))
    .pipe(connect.reload());
});

/**
 * Clean up dist directory.
 */
gulp.task('clean:dist', ['test'], function() {
    return gulp.src('./dist', {read: false})
    .pipe(clean());
});

/**
 * Minify JS files.
 * Require.js config example:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
gulp.task('build:js', ['clean:dist'], function() {
    return gulp.src('./app/scripts/main.js')
    // Require.js optimizer
    .pipe(rjs({
        name: 'main',
        baseUrl                : './app/scripts',
        mainConfigFile         : './app/scripts/main.js',
        optimize               : 'none',
        paths: {
            'workers': 'empty:'
        },
        exclude                : [
            'helpers/db',
            'mathjax',
            'dropbox',
            'tv4',
            'bluebird',
            'remotestorage'
        ],
        include                : [
            // Because settings views are loaded dynamically
            'apps/settings/show/views/encryption',
            'apps/settings/show/views/general',
            'apps/settings/show/views/importExport',
            'apps/settings/show/views/keybindings',
            'apps/settings/show/views/profiles',
            'apps/settings/show/views/showView',
            'apps/settings/show/views/sync',
            'backbone.sync',
            'backbone.noworker.sync',
            'modules/remotestorage/module',
            'modules/dropbox/module'
        ],
        findNestedDependencies : true,
        generateSourceMaps     : true,
        useStrict              : true,
        wrapShim               : true,
        preserveLicenseComments: true,
        wrap                   : true
    }))
    .pipe(uglify({
        preserveComments: 'license'
    }))
    .pipe(gulp.dest('./dist/scripts'));
});

/**
 * Minify HTML files.
 */
gulp.task('htmlmin', ['clean:dist'], function() {
    return gulp.src('./app/*.html')
    .pipe(replace('<html class="no-js">', '<html manifest="app.appcache" class="no-js">'))
    .pipe(htmlmin({
        conditionals: true,
        spare       : true
    }))
    .pipe(gulp.dest('./dist'));
});

/**
 * Minify CSS files.
 */
gulp.task('cssmin', ['clean:dist'], function() {
    return gulp.src('./app/styles/*.css')
    .pipe(cssmin({
        compatibility: 'ie8'
    }))
    .pipe(gulp.dest('./dist/styles'));
});

/**
 * Copy additional dependencies into dist directory.
 */
gulp.task('copy:deps', ['clean:dist'], function() {
    var options = {base: './app/bower_components/'};

    return merge.apply(merge, [
        gulp.src([
            './LICENSE'
        ], {base: './'})
        .pipe(gulp.dest('./dist')),

        // Copy
        gulp.src([
            './app/images/**/*.+(png|jpg|gif|ico|icns)',
            './app/docs/**',
            './app/locales/**',
            './app/.htaccess',
            './app/*.+(xml|ico|txt|webapp)',
            './app/styles/**/*.+(eot|svg|ttf|woff)',
        ], {base: './app'})
        .pipe(gulp.dest('./dist')),

        // Copy and minify
        gulp.src([
            './app/scripts/helpers/db.js',
            './app/scripts/workers/localForage.js',
            './app/bower_components/requirejs/require.js',
            './app/bower_components/modernizr/modernizr.js',
            './app/bower_components/q/q.js',
            './app/bower_components/underscore/underscore.js',
            './app/bower_components/localforage/dist/localforage.js',
            './app/bower_components/dropbox/dropbox.js',
            './app/bower_components/remotestorage.js/release/stable/remotestorage.js',
            './app/bower_components/tv4/tv4.js',
            './app/bower_components/bluebird/js/browser/bluebird.min.js',
            './app/bower_components/dropbox/dropbox',
        ], options)
        .pipe(uglify({
            preserveComments: 'license'
        }))
        .pipe(gulp.dest('./dist/bower_components/')),

        // Copy MathJax files
        gulp.src([
            './app/bower_components/MathJax/*.js',
            './app/bower_components/MathJax/config/TeX-AMS-MML_HTMLorMML.js',
            './app/bower_components/MathJax/images/**',
            './app/bower_components/MathJax/extensions/**',
            './app/bower_components/MathJax/fonts/HTML-CSS/TeX/woff/**',
            './app/bower_components/MathJax/jax/element/**',
            './app/bower_components/MathJax/jax/input/+(MathML|TeX)/**',
            './app/bower_components/MathJax/jax/output/+(HTML-CSS|NativeMML)/**',
            './app/bower_components/MathJax/localization/en/**'
        ], options)
        .pipe(gulp.dest('./dist/bower_components/')),

        // Copy ACE themes
        gulp.src([
            'bower_components/ace/lib/ace/css/editor.css',
            'bower_components/ace/lib/ace/theme/textmate.css',
            'bower_components/ace/lib/ace/theme/github.css'
        ], options)
        .pipe(gulp.dest('./dist/bower_components/')),
    ]);
});

/**
 * Generate HTML5 cache manifest file.
 */
gulp.task('manifest', ['build:before'], function() {
    return gulp.src('dist/**', {base: './dist'})
    .pipe(manifest({
        hash         : true,
        preferOnline : true,
        network      : ['*'],
        filename     : 'app.appcache',
        exclude      : ['app.appcache', 'dropbox.html'],
        timestamp    : true,
        master       : ['index.html'],
        fallback     : ['/ 404.html']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task(
    'build:before',
    [
        'clean:dist',
        'less',
        'copy:deps',
        'build:js',
        'htmlmin',
        'cssmin'
    ],
    function() {
        return;
    }
);

gulp.task('build', ['build:before', 'manifest'], function() {
    return;
});

/**
 * ------------------
 * Build Electron app.
 * ------------------
 */
gulp.task('electron:copy', function() {
    return gulp.src([
        './node_modules/buffer-crc32/**',
        './node_modules/bytes/**',
        './node_modules/connect/**',
        './node_modules/cookie/**',
        './node_modules/cookie-signature/**',
        './node_modules/debug/**',
        './node_modules/electron-window-state/**',
        './node_modules/fresh/**',
        './node_modules/jsonfile/**',
        './node_modules/mime/**',
        './node_modules/on-headers/**',
        './node_modules/parseurl/**',
        './node_modules/range-parser/**',
        './node_modules/send/**',
        './node_modules/serve-static/**',
        './node_modules/type-is/**',
        './node_modules/open/**',
        './node_modules/mkdirp/**',
        './package.json'
    ], {base: './'})
    .pipe(gulp.dest('./dist/'));
});

gulp.task('electron', ['electron:copy'], function() {
    return gulp.src('./electron.js')
    .pipe(replace('__dirname + \'/dist\'', '__dirname'))
    .pipe(gulp.dest('./dist'))
    .pipe(electron({
        src         : './dist',
        packageJson : pkg,
        release     : './release',
        cache       : './.tmp',
        version     : 'v0.35.2',
        packaging   : true,
        // rebuild     : true,
        platforms   : [
            'darwin-x64',
            // 'linux-arm',
            'linux-ia32',
            'linux-x64',
            'win32-ia32',
            'win32-x64'
        ],
        platformResources: {
            darwin: {
                CFBundleDisplayName : pkg.name,
                CFBundleIdentifier  : pkg.name,
                CFBundleName        : pkg.name,
                CFBundleVersion     : pkg.version,
                icon                : './app/images/icon/icon-512x512.icns'
            },
            win: {
                'version-string'    : pkg.version,
                'file-version'      : pkg.version,
                'product-version'   : pkg.version,
                'icon'              : './resources/app/images/icon/icon-120x120.png'
            }
        }
    }));
});
