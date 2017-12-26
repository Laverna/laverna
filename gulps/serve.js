'use strict';

/**
 * @file Live reload server.
 *
 * @example gulp serve // Starts live-reload server
 */
module.exports = (gulp, $) => {
    return () => {
        $.browserSync.init({
            notify    : false,
            open      : !$.util.env.dev,
            server    : $.util.env.root || $.distDir,
            port      : $.util.env.port || 9000,
            ghostMode : $.util.env.ghostMode !== undefined,
        });

        // Watch for changes in SASS and HTML
        gulp.watch('app/styles/**/*.less', ['css']);
        gulp.watch('app/*.html', ['html']);

        // Re-bundle if some new packages were installed
        gulp.watch('package.json', ['bundle']);
    };
};
