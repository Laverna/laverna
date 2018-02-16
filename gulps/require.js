'use strict';

/**
 * Minify JS files.
 * Require.js config example:
 * https://github.com/jrburke/r.js/blob/master/build/example.build.js
 */
module.exports = function(gulp, plugins) {
    return function() {
        return gulp.src('./app/scripts/main.js')
        // Require.js optimizer
        .pipe(plugins.requirejsOptimize({
            name           : 'main',
            baseUrl        : './app/scripts',
            mainConfigFile : './app/scripts/main.js',
            optimize       : 'none',
            paths: {
                'workers': 'empty:'
            },
            exclude        : [
                'markdown-it',
                'markdown-it-san',
                'markdown-it-hash',
                'markdown-it-math',
                'modules/markdown/libs/markdown-it-file',
                'modules/markdown/libs/markdown-it-task',
                'modules/markdown/libs/markdown-it',
                'modules/markdown/libs/markdown',

                'migrate',
                'helpers/db',
                'helpers/migrate',

                'backbone',
                'backbone.radio',
                'jquery',
                'prism',
                'q',
                'underscore',
                'localforage',
                'dropbox',
                'classes/sjcl',
                'sjcl',
                'remotestorage',
                'tv4',
                'bluebird',
                'mathjax',
            ],
            include        : [
                // Because settings views are loaded dynamically
                'apps/settings/show/views/encryption',
                'apps/settings/show/views/general',
                'apps/settings/show/views/editor',
                'apps/settings/show/views/importExport',
                'apps/settings/show/views/keybindings',
                'apps/settings/show/views/profiles',
                'apps/settings/show/views/showView',
                'apps/settings/show/views/sync',
                'apps/settings/show/views/modules',

                'apps/settings/module/app',
                'apps/settings/module/controller',
                'views/loader',

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
        .pipe(plugins.util.env.dev ? plugins.util.noop() : plugins.uglify({
            preserveComments: 'license'
        }))
        .pipe(gulp.dest('./dist/scripts'));
    };
};
