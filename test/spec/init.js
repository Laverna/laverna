/* global mocha, requirejs */
requirejs([
    'chai',
    'underscore',
    'chai-jquery',
    'chai-promise',
    'helpers/radio.shim',
], function(chai, _, chaiJquery, chaiAsPromised) {
    'use strict';

    // Setup Mocha and Chai
    mocha.setup('bdd');
    mocha.bail(false);
    chai.use(chaiJquery);
    chai.use(chaiAsPromised);

    // Make `expect` and `should` globally available
    window.expect = chai.expect;
    window.should = chai.should();

    requirejs([

        // Core
        'spec/app',

    ], function() {
        if (window.__karma__) {
            return window.__karma__.start();
        }

        mocha.reporter('html');
        (window.mochaPhantomJS || mocha).run();
    });

});
