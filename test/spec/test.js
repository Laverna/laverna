/* global requirejs */
requirejs.config({
    baseUrl: '../app/scripts',

    paths: {
        'chai-jquery' : '../../test/bower_components/chai-jquery/chai-jquery',
        'spec'        : '../../test/spec',
        'init'        : '../../test/spec/init'
    },

    shim: {
        'chai-jquery': ['jquery'],
    },

    urlArgs: 'bust=' + (new Date()).getTime(),
    waitSeconds: 15
});

/**
 * Just include main.js and it will include init script
 */
requirejs(['main']);
