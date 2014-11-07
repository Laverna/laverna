/* global chai, define, describe, before, it */
define([
    'backbone',
    'marionette',
    'app'
], function(Backbone, Marionette, App) {
    'use strict';

    var expect = chai.expect;

    describe('App test', function() {
        before(function() {
            App.reqres.setHandler('configs', function() {
                return {};
            });
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

            it('has regions', function() {
                expect(typeof App.content).to.be.equal('object');
                expect(typeof App.sidebar).to.be.equal('object');
                expect(typeof App.sidebarNavbar).to.be.equal('object');
                expect(typeof App.modal).to.be.equal('object');
                expect(typeof App.brand).to.be.equal('object');
            });
        });

        describe('events', function() {
            it('triggers "app:init" and then "app:start"', function(done) {
                var events = 0;
                App.vent
                    .once('app:init', function() {
                        events++;
                    })
                    .once('app:start', function() {
                        expect(events + 1).to.be.equal(2);
                        expect(typeof App.settings).to.be.equal('object');
                        done();
                    });

                App.start();
            });
        });
    });
});
