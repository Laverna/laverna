'use strict';
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'
// templateFramework: 'lodash'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    var pkg = grunt.file.readJSON('package.json');

    // phonegap configs
    var phonegapConfig = {
		config: {
			root: '<%= yeoman.dist %>',
			// config: 'config.xml',
            config: {
                template: 'config.xml',
                data: {
                    id: 'org.phonegap.laverna',
                    version: pkg.version,
                    name: pkg.name
                }
            },
			cordova: '.cordova',
			path: 'phonegap',
			plugins: [],
			platforms: ['android'],
			verbose: false,
            releases: 'releases',
            releaseName: function () {
                return (pkg.name + '-' + pkg.version);
            },
            icons: {
                android: {
                    ldpi  : 'phonegap/www/images/icon/icon-32x32.png',
                    mdpi  : 'phonegap/www/images/icon/icon-48x48.png',
                    hdpi  : 'phonegap/www/images/icon/icon-64x64.png',
                    xhdpi : 'phonegap/www/images/icon/icon-90x90.png'
                }
            }
		}
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        phonegap: phonegapConfig,

        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                nospawn: true,
                livereload: true
            },
            coffee: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
                tasks: ['coffee:dist']
            },
            coffeeTest: {
                files: ['test/spec/{,*/}*.coffee'],
                tasks: ['coffee:test']
            },
            less: {
                files: ['{.tmp,<%= yeoman.app %>}/styles/{,*/}*.less'],
                tasks: ['less']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                    '<%= yeoman.app %>/scripts/templates/*.{ejs,mustache,hbs}',
                    'test/spec/**/*.js'
                ]
            },
            jst: {
                files: [
                    '<%= yeoman.app %>/scripts/templates/*.ejs'
                ],
                tasks: ['jst']
            },
            test: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.js', 'test/spec/**/*.js'],
                tasks: ['test:true']
            }
        },
        connect: {
            options: {
                port: SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            },
            test: {
                path: 'http://localhost:<%= connect.test.options.port %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                '!<%= yeoman.app %>/scripts/libs/dropbox.js',
                'test/spec/{,*/}*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.test.options.port %>/index.html']
                }
            }
        },
        coffee: {
            dist: {
                files: [{
                    // rather than compiling multiple files here you should
                    // require them into your main .coffee file
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        // Compile less files
        less: {
            compile: {
                options: {
                    compress: false,
                    dumpLineNumbers: 'comments',
                    sourceMap: 'true',
                    sourceMapFilename: '<%= yeoman.app %>/styles/main.css.map',
                    sourceMapBasepath: '<%= yeoman.app %>/styles/'
                },
                files : {
                    '<%= yeoman.app %>/styles/theme-default/index.css': '<%= yeoman.app %>/styles/theme-default/index.less',
                    '<%= yeoman.app %>/styles/theme-default/welcome.css': '<%= yeoman.app %>/styles/theme-default/welcome.less'
                }
            }
        },
        // Scale icons
        'responsive_images': {
            icons: {
                options: {
                    engine: 'gm',
                    sizes: [{
                        width: 256,
                        height: 256
                    }, {
                        width: 196,
                        height: 196
                    }, {
                        width: 128,
                        height: 128
                    }, {
                        width: 90,
                        height: 90
                    }, {
                        width: 64,
                        height: 64
                    }, {
                        width: 60,
                        height: 60
                    }, {
                        width: 48,
                        height: 48
                    }, {
                        width: 32,
                        height: 32
                    }, {
                        width: 30,
                        height: 30
                    }, {
                        width: 16,
                        height: 16
                    }]
                },
                files: {
                    '<%= yeoman.app %>/images/icon/icon.png': '<%= yeoman.app %>/images/icon/icon.png'
                }
            }
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: '<%= yeoman.app %>/scripts',
                    mainConfigFile: '<%= yeoman.app %>/scripts/main.js',
                    optimize: 'none',
                    exclude : ['dropbox', 'remotestorage'],
                    // include : [],
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    findNestedDependencies: true,
                    useStrict: true,
                    wrapShim: true,
                    wrap: true
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2
                }
            }
        },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    // src: '{,*/}*.{png,jpg,jpeg}',
                    src: '*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/theme-default/welcome.css': [
                        '<%= yeoman.app %>/styles/theme-default/welcome.css'
                    ],
                    '<%= yeoman.dist %>/styles/theme-default/index.css': [
                        '<%= yeoman.app %>/styles/theme-default/index.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif,png}',
                        'font/*',
                        'locales/*/*',
                        'docs/*.md'
                    ]
                },
                {
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        'manifest.webapp',
                        'scripts/libs/dropbox.js',
                        'bower_components/remotestorage.js/release/0.10.0-beta3/remotestorage-nocache.amd.js',
                        'bower_components/pagedown/Markdown.Editor.js',
                        'bower_components/ace/lib/ace/css/editor.css',
                        'bower_components/ace/lib/ace/theme/textmate.css',
                        'bower_components/ace/lib/ace/theme/github.css',
                        // MathJax files: https://github.com/mathjax/MathJax/wiki/Shrinking-MathJax-for-%22local%22-installation
                        'bower_components/MathJax/*.js',
                        'bower_components/MathJax/config/TeX-AMS-MML_HTMLorMML.js',
                        'bower_components/MathJax/images/**',
                        'bower_components/MathJax/extensions/**',
                        'bower_components/MathJax/fonts/HTML-CSS/TeX/woff/**',
                        'bower_components/MathJax/jax/element/**',
                        'bower_components/MathJax/jax/input/{MathML,TeX}/**',
                        'bower_components/MathJax/jax/output/{HTML-CSS,NativeMML}/**',
                        'bower_components/MathJax/localization/en/**'
                    ]
                }]
            }
        },
        // Replace string
        'string-replace': {
            // App version
            appVersion: {
                files: {
                    '<%= yeoman.app %>/scripts/constants.js': '<%= yeoman.app %>/scripts/constants.js',
                    '<%= yeoman.app %>/scripts/collections/configs.js': '<%= yeoman.app %>/scripts/collections/configs.js',
                    'README.md' : 'README.md',
                    '<%= yeoman.app %>/manifest.webapp' : '<%= yeoman.app %>/manifest.webapp'
                },
                options: {
                    replacements: [
                        {
                            pattern: /constants\.VERSION = *.*.*/,
                            replacement: 'constants.VERSION = \'<%= pkg.version %>\';'
                        },
                        {
                            pattern: /\'appVersion\', *.*.*/,
                            replacement: '\'appVersion\', value: \'<%= pkg.version %>\' }));'
                        },
                        {
                            pattern: /git checkout *.*.*/,
                            replacement: 'git checkout <%= pkg.version %>',
                        },
                        {
                            pattern: /\"version\": \"*.*.*\"\,/,
                            replacement: '"version": "<%= pkg.version %>",',
                        }
                    ]
                }
            },
            // i18next cache to localStorage in production
            i18nextLocal: {
                files: {
                    '<%= yeoman.app %>/scripts/app.js': '<%= yeoman.app %>/scripts/app.js'
                },
                options: {
                    replacements: [
                        {
                            pattern: /useLocalStorage\ :\ (true|false)/ig,
                            replacement: function (str, status) {
                                if (status === 'false') {
                                    return 'useLocalStorage : true';
                                }
                                else {
                                    return 'useLocalStorage : false';
                                }
                            }
                        }
                    ]
                }
            },
            // Cache manifest <html manifest=
            manifest: {
                files : {
                    '<%= yeoman.dist %>/index.html' : '<%= yeoman.dist %>/index.html',
                    // '<%= yeoman.dist %>/welcome.html' : '<%= yeoman.dist %>/welcome.html',
                    '<%= yeoman.dist %>/404.html' : '<%= yeoman.dist %>/404.html'
                },
                options: {
                    replacements: [
                        {
                            pattern: /<html class="no-js/,
                            replacement: '<html manifest="manifest.appcache" class="no-js'
                        }
                    ]
                }
            }
        },
        // Web Application cache manifest
        manifest: {
            generate: {
                options: {
                    basePath: '<%= yeoman.dist %>',
                    cache: [
                    ],
                    network: ['*'],
                    fallback: ['/ 404.html'],
                    preferOnline: true,
                    verbose: true,
                    timestamp: true,
                    hash: true,
                    exclude: ['welcome.html', 'dropbox.html'],
                    master: ['index.html']
                },
                src: [
                    '*.html',
                    'favicon.ico',
                    'robots.txt',
                    'docs/*.md',
                    'scripts/{,*/}*.js',
                    'styles/{,*/}*.css',
                    'images/{,*/}*.{webp,gif,png}',
                    'font/*',
                    'bower_components/requirejs/require.js',
                    'bower_components/pagedown/Markdown.Editor.js',
                    'bower_components/ace/lib/ace/{,*/}*.css',
                    'bower_components/MathJax/MathJax.js'
                ],
                dest: '<%= yeoman.dist %>/manifest.appcache'
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },
        jst: {
            options: {
                amd: true
            },
            compile: {
                files: {
                    '.tmp/scripts/templates.js': ['<%= yeoman.app %>/scripts/templates/*.ejs']
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '/styles/fonts/{,*/}*.*',
                    ]
                }
            }
        }
    });

    grunt.registerTask('createDefaultTemplate', function () {
        grunt.file.write('.tmp/scripts/templates.js', 'this.JST = this.JST || {};');
    });

    grunt.registerTask('server', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:server', 'connect:dist:keepalive']);
        }

        if (target === 'test') {
            return grunt.task.run([
                'clean:server',
                'coffee',
                'createDefaultTemplate',
                'jst',
                'connect:test',
                'open:test',
                // 'watch:livereload'
            ]);
        }

        grunt.task.run([
            'clean:server',
            'coffee:dist',
            'createDefaultTemplate',
            'jst',
            'less',
            'connect:livereload',
            'open:server',
            'watch'
        ]);
    });

    grunt.registerTask('test', function (isConnected) {
        isConnected = Boolean(isConnected);
        var testTasks = [
                'clean:server',
                // 'coffee',
                'createDefaultTemplate',
                'jst',
                'connect:test',
                'mocha',
                // 'watch:test'
            ];

        if(!isConnected) {
            return grunt.task.run(testTasks);
        } else {
            // already connected so not going to connect again, remove the connect:test task
            testTasks.splice(testTasks.indexOf('connect:test'), 1);
            return grunt.task.run(testTasks);
        }
    });

    // Change App version in scripts
    grunt.registerTask('version', [
        'string-replace:appVersion'
    ]);

    // Compile less file
    grunt.registerTask('lessc', [
        'less'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'string-replace:i18nextLocal',
        // 'coffee',
        'createDefaultTemplate',
        'jst',
        'lessc',
        'useminPrepare',
        'requirejs',
        'imagemin',
        'htmlmin',
        'concat',
        'cssmin',
        'uglify',
        'rev',
        'copy',
        'string-replace:manifest',
        'usemin',
        'string-replace:i18nextLocal',
        'manifest'
    ]);

	grunt.registerTask('platform-build', [
		// 'default',
        'build',
		'phonegap:build'
	]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'version',
        'build'
    ]);
};
