'use strict';

module.exports = function(gulp, plugins, pkg) {
    return function() {
        var platforms = [
            'darwin-x64',
            // 'linux-arm',
            'linux-ia32',
            'linux-x64',
            'win32-ia32',
            'win32-x64'
        ];

        if (plugins.util.env.platform) {
            platforms = [plugins.util.env.platform];
        }

        return gulp.src('./electron.js')
        // .pipe(replace('__dirname + \'/dist\'', '__dirname'))
        .pipe(gulp.dest('./release/laverna'))
        .pipe(plugins.electron({
            src         : './release/laverna',
            packageJson : pkg,
            release     : './release',
            cache       : './.tmp',
            version     : 'v0.35.2',
            packaging   : true,
            // rebuild     : true,
            platforms   : platforms,
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
    };
};
