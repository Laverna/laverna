/* global define, describe, before, after, it, chai */
define([
    'app',
    'apps/notes/appNote'
], function(App, AppNote) {
    'use strict';

    var expect = chai.expect;

    describe('AppNote module', function() {
        before(function() {
        });

        after(function() {
        });

        it('is an object', function() {
            expect(typeof AppNote).to.be.equal('object');
        });
    });
});
