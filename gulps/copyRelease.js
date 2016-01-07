'use strict';

module.exports = function(gulp) {
    return function() {
        return gulp.src([
            './node_modules/connect/**',
            './node_modules/buffer-crc32/**',
            './node_modules/fresh/**',
            './node_modules/bytes/**',
            './node_modules/cookie/**',
            './node_modules/cookie-signature/**',
            './node_modules/mime/**',
            './node_modules/debug/**',
            './node_modules/depd/**',
            './node_modules/finalhandler/**',
            './node_modules/on-headers/**',
            './node_modules/parseurl/**',
            './node_modules/range-parser/**',
            './node_modules/serve-static/**',
            './node_modules/type-is/**',
            './node_modules/send/**',

            './node_modules/colors/**',
            './node_modules/optimist/**',
            './node_modules/electron-window-state/**',
            './node_modules/open/**',
            './node_modules/jsonfile/**',
            './node_modules/mkdirp/**',
            './node_modules/wordwrap/**',
            './server.js',
            './package.json'
        ], {base: './'})
        .pipe(gulp.dest('./release/laverna'));
    };
};
