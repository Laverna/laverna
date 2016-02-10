'use strict';
var merge = require('merge-stream');

/**
 * Copy additional dependencies into dist directory.
 */
module.exports = function(gulp, plugins) {
    return function() {
        var options = {base: './app/bower_components/'};

        return merge.apply(merge, [
            gulp.src([
                './LICENSE'
            ], {base: './'})
            .pipe(gulp.dest('./dist')),

            // Copy
            gulp.src([
                './app/bower_components/prism/themes/prism.css',
                './app/images/**/*.+(png|jpg|gif|ico|icns)',
                './app/docs/**',
                './app/locales/**',
                './app/.htaccess',
                './app/*.+(xml|ico|txt|webapp)',
                './app/styles/**/*.+(eot|svg|ttf|woff)',
            ], {base: './app'})
            .pipe(gulp.dest('./dist')),

            // Copy and minify excluded modules
            gulp.src([
                './app/scripts/modules/markdown/libs/markdown-it-file.js',
                './app/scripts/modules/markdown/libs/markdown-it-task.js',
                './app/scripts/modules/markdown/libs/markdown-it.js',
                './app/scripts/modules/markdown/libs/markdown.js',
                './app/scripts/modules/markdown/workers/markdown.js',

                './app/scripts/workers/sjcl.js',
                './app/scripts/classes/sjcl.js',
                './app/scripts/classes/sjcl.worker.js',

                './app/scripts/helpers/db.js',
                './app/scripts/helpers/migrate.js',
                './app/scripts/migrate.js',
                './app/scripts/workers/localForage.js',
            ], {base: './app'})
            .pipe(plugins.util.env.dev ? plugins.util.noop() : plugins.uglify({
                preserveComments: 'license'
            }))
            .pipe(gulp.dest('./dist')),

            // Copy and minify Bower components
            gulp.src([
                './app/bower_components/markdown-it*/dist/*.min.js',

                './app/bower_components/backbone/backbone.js',
                './app/bower_components/jquery/dist/jquery.js',
                './app/bower_components/backbone.radio/build/backbone.radio.min.js',
                './app/bower_components/prism/bundle.js',
                './app/bower_components/requirejs/require.js',
                './app/bower_components/modernizr/modernizr.js',
                './app/bower_components/q/q.js',
                './app/bower_components/underscore/underscore.js',
                './app/bower_components/localforage/dist/localforage.js',
                './app/bower_components/dropbox/dropbox.js',
                './app/bower_components/sjcl/sjcl.js',

                // Remotestorage
                './app/bower_components/remotestorage.js/release/stable/remotestorage.js',
                './app/bower_components/tv4/tv4.js',
                './app/bower_components/bluebird/js/browser/bluebird.min.js',
            ], options)
            .pipe(plugins.util.env.dev ? plugins.util.noop() : plugins.uglify({
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
        ]);
    };
};
