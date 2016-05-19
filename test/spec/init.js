/* global define, requirejs, mocha, chai */
define([
    'underscore',
    'jquery',
    'chai-jquery',
    'i18next',
    'helpers/i18next',
    'helpers/radio.shim',
    'bootstrap'
], function(_, $, chaiJquery) {
    'use strict';

    var runner = window.mochaPhantomJS || mocha,
        tests;

    tests = [

        // Core
        'spec/app.js',

        // Classes
        'spec/classes/sjcl',
        'spec/classes/encryption',

        // Models
        'spec/models/note',
        'spec/models/notebook',

        // Collections
        'spec/collections/notes',

        // Helpers
        'spec/helpers/storage',
        'spec/helpers/uri',

        // Modules
        'spec/apps/confirm/test',
        'spec/apps/encryption/test',
        'spec/apps/help/test',
        'spec/apps/navbar/test',
        'spec/apps/notebooks/test',
        // 'spec/apps/notes/test',
        'spec/apps/settings/test'
    ];

    // Setup
    mocha.bail(false);
    chai.use(chaiJquery);

    // Underscore template
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        evaluate: /<%([\s\S]+?)%>/g
    };

    // Run tests when DOM is ready
    $(function() {
        requirejs(tests, function() {

            // Run tests
            runner.run();
        });
    });
});
