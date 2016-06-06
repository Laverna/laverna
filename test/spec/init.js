/* global mocha, requirejs */
requirejs([
    'chai',
    'underscore',
    'chai-jquery',
    'chai-promise',
    'sinon-chai',
    'helpers/radio.shim',
], function(chai, _, chaiJquery, chaiAsPromised, sinon) {
    'use strict';

    // Setup Mocha and Chai
    mocha.setup('bdd');
    mocha.bail(false);
    chai.use(chaiJquery);
    chai.use(chaiAsPromised);
    chai.use(sinon);

    // Make `expect` and `should` globally available
    window.expect = chai.expect;
    window.should = chai.should();

    requirejs([

        // Core
        'spec/app',
        'spec/moduleLoader',
        'spec/initializers',

        // Helpers
        'spec/helpers/underscore-util',
        'spec/helpers/db',
        'spec/helpers/storage',
        'spec/helpers/uri',

        // Models
        'spec/models/note',
        'spec/models/notebook',
        'spec/models/tag',
        'spec/models/file',
        'spec/models/config',

        // Collections
        'spec/collections/notes',
        'spec/collections/notebooks',
        'spec/collections/tags',
        'spec/collections/configs',
        'spec/collections/pageable',

        // Collection modules
        'spec/collections/modules/notes',
        'spec/collections/modules/notebooks',
        'spec/collections/modules/tags',
        'spec/collections/modules/files',
        'spec/collections/modules/configs',
        'spec/collections/modules/module',

    ], function() {
        if (window.__karma__) {
            return window.__karma__.start();
        }

        mocha.reporter('html');
        (window.mochaPhantomJS || mocha).run();
    });

});
