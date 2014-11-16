/* global chai, define, describe, before, after, it */
define([
    'underscore',
    'backbone',
    'marionette',
    'collections/configs',
    'app'
], function(_, Backbone, Marionette, Configs, App) {
    'use strict';

    var expect = chai.expect;

    describe('App test', function() {
        var configs;

        before(function() {
            Backbone.history.stop();

            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            App.reqres.setHandler('configs', function() {
                return configs;
            });
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

            it('has regions', function() {
                expect(typeof App.content).to.be.equal('object');
                expect(typeof App.sidebar).to.be.equal('object');
                expect(typeof App.sidebarNavbar).to.be.equal('object');
                expect(typeof App.modal).to.be.equal('object');
                expect(typeof App.brand).to.be.equal('object');
            });
        });

        describe('events', function() {
            it('triggers "app:init" before App has started', function(done) {
                App.vent.once('app:init', function() {
                    expect(typeof App.settings).to.be.equal('object');
                    expect(typeof App.constants).to.be.equal('object');
                    done();
                });
                App.trigger('before:start');
            });

            it('triggers "app:start" when App has started', function(done) {
                App.vent.once('app:start', function() {
                    done();
                });
                App.trigger('start');
            });
        });
    });
});
