/* global define, describe, before, after, it, chai */
define([
    'backbone',
    'backbone.radio',
    'apps/notes/list/listApp',
    'spec/apps/notes/list/controller'
], function(Backbone, Radio, ListApp) {
    'use strict';

    var expect = chai.expect;

    describe('Notes list module', function() {

        before(function() {
            ListApp.start();
        });

        after(function() {
            ListApp.controller.view = new Backbone.View();
            ListApp.stop();
        });

        it('is an object', function() {
            expect(typeof ListApp).to.be.equal('object');
        });

        it('instantiates a controller on start', function() {
            expect(typeof ListApp.controller).to.be.equal('object');
        });

        it('complies to `filter` command', function(done) {
            Radio.replyOnce('notes', 'filter', function() {
                done();
                return [];
            });

            Radio.request('appNote', 'filter', {filter: 'favorite'});
        });
    });
});
