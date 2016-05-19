/* global chai, define, describe, before, after, it */
define([
    'underscore',
    'backbone',
    'marionette',
    'backbone.radio',
    'app'
], function(_, Backbone, Marionette, Radio, App) {
    'use strict';

    var expect = chai.expect;

    describe('App test', function() {

        before(function() {
            Backbone.history.stop();
        });

        after(function() {
            Backbone.history.stop();
        });

        describe('core', function() {

            it('is ok', function() {
                expect(App !== undefined).to.be.equal(true);
            });

            it('is instance of Marionette.Application class', function() {
                expect(App instanceof Marionette.Application).to.be.equal(true);
            });

            it('has "startSubApp" method', function() {
                expect(typeof App.startSubApp).to.be.equal('function');
            });

        });

        describe('events', function() {
            it('triggers "app:init" before App has started', function(done) {
                Radio.once('global', 'app:init', done);
                App.trigger('before:start');
            });

            it('triggers "app:start" after App has started', function(done) {
                Radio.once('global', 'app:start', done);
                App.trigger('start');
            });
        });
    });
});
