/* global chai, define, describe, before, it */
define([
    'underscore',
    'jquery',
    'spec/apps/settings/show/formBehavior',
    'apps/settings/show/views/basic',
    'collections/configs',
    'text!locales/locales.json'
], function (_, $, settingsBehavior, Basic, Configs, locales) {
    'use strict';

    var expect = chai.expect;

    describe('Basic settings view', function () {
        var view,
            configs;

        before(function (done) {
            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            locales = _.keys(JSON.parse(locales));
            view = new Basic({
                el: $('<div>'),
                collection: configs
            });

            view.render();
            done();
        });

        describe('Instantiated', function () {
            it('should exist', function () {
                expect(view).to.be.ok();
                expect(view.collection).to.be.ok();
            });

            it('has behaviors', function () {
                expect(view.behaviors).to.be.ok();
                expect(view.behaviors.hasOwnProperty('FormBehavior')).to.be.ok();
            });

            it('shows language options', function () {
                expect(locales.length > 0).to.be.ok();
                expect($('#appLang option', view.$el).length).to.be.equal(locales.length);
            });
        });

        describe('Events', function () {
            it('changes it\'s value to random data', function (done) {
                view.ui.saltInput.on('change', function () {
                    expect(view.ui.saltInput.val() !== '').to.be.ok();
                    expect(view.ui.saltInput.val().length > 8).to.be.ok();
                    view.ui.saltInput.off('change');
                    done();
                });
                $('#randomize', view.$el).click();
            });
        });

        describe('Triggers events', function () {
            it('collection:new:value when something has changed', function (done) {
                settingsBehavior(view, done);
            });
        });
    });
});
