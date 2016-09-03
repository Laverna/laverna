/* global chai, define, describe, before, it */
define([
    'underscore',
    'jquery',
    'spec/apps/settings/show/formBehavior',
    'apps/settings/show/views/general',
    'collections/configs',
    'text!locales/locales.json'
], function(_, $, settingsBehavior, Basic, Configs, locales) {
    'use strict';

    var expect = chai.expect;

    describe('Basic settings view', function() {
        var view,
            configs;

        before(function(done) {
            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            locales = _.keys(JSON.parse(locales));
            view = new Basic({
                el: $('<div>'),
                collection: configs,
                useDefault: configs.get('useDefaultConfigs')
            });

            view.render();
            done();
        });

        describe('Instantiated', function() {
            it('should exist', function() {
                expect(view instanceof Basic).to.be.equal(true);
                expect(view.collection instanceof Configs).to.be.equal(true);
            });

            it('has behaviors', function() {
                expect(typeof view.behaviors).to.be.equal('object');
                expect(view.behaviors.hasOwnProperty('FormBehavior')).to.be.equal(true);
            });

            it('shows language options', function() {
                expect(locales.length > 0).to.be.equal(true);
                expect($('#appLang option', view.$el).length).to.be.equal(locales.length);
            });
        });

        describe('Triggers events', function() {
            it('collection:new:value when something has changed', function(done) {
                settingsBehavior(view, done);
            });
        });
    });
});
