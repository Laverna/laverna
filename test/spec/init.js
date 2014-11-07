/* global define, requirejs, mocha, chai, mochaPhantomJS */
define([
    'underscore',
    'jquery',
    'chai-jquery',
    'IndexedDBShim',
    'i18next',
    'helpers/i18next',
    'bootstrap'
], function(_, $, chaiJquery) {
    'use strict';

    var tests = [
        // Models
        'spec/models/note',
        'spec/models/notebook',

        // Collections
        'spec/collections/notes',

        // Libs
        'spec/libs/tags',

        // Helpers
        'spec/helpers/storage',
        'spec/helpers/configs',
        'spec/helpers/uri',
        // 'spec/helpers/sync/sync',

        // Core
        'spec/app.js',

        // Modules
        'spec/apps/confirm/test',
        'spec/apps/encryption/test',
        'spec/apps/help/test',
        'spec/apps/navbar/test',
        'spec/apps/notebooks/test',
        'spec/apps/notes/test',
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
            if (window.mochaPhantomJS) {
                console.log('It is PhantomJS');

                // Run tests
                mochaPhantomJS.run();
            }
            else {
                mocha.run();
            }
        });
    });
});
