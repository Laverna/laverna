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

    ], function() {
        if (window.__karma__) {
            return window.__karma__.start();
        }

        mocha.reporter('html');
        (window.mochaPhantomJS || mocha).run();
    });

});
