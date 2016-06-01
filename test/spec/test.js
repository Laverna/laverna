/* global requirejs */
var dir = {
    base  : (window.__karma__ ? '/base/' : '../'),
    other : (window.__karma__ ? '/base/app/' : '../'),
    test  : (window.__karma__ ? '/base/' : '../../'),
};

requirejs.config({
    baseUrl : dir.base + 'app/scripts',
    urlArgs : 'bust=' + (new Date()).getTime(),
    deps    : ['modernizr'],

    paths   : {
        'modernizr'    : dir.other + 'bower_components/modernizr/modernizr',
        'chai'         : dir.test + 'test/bower_components/chai/chai',
        'chai-jquery'  : dir.test + 'test/bower_components/chai-jquery/chai-jquery',
        'chai-promise' : dir.test + 'test/bower_components/chai-as-promised/lib/chai-as-promised',
        'sinon-chai'   : dir.test + 'test/bower_components/sinon-chai/lib/sinon-chai',
        'sinon'        : dir.test + 'test/bower_components/sinonjs/sinon',
        'spec'         : dir.test + 'test/spec',
        'init'         : dir.test + 'test/spec/init',
    },

    map: {
        '*': {
            'classes/sjcl.worker' : 'classes/sjcl'
        }
    },

    shim: {
        'chai-jquery': ['jquery'],
    },

});

/**
 * Just include main.js and it will include init script
 */
requirejs(['main']);
