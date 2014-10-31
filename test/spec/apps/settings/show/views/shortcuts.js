/* global chai, define, describe, before, it */
define([
    'jquery',
    'spec/apps/settings/show/formBehavior',
    'collections/configs',
    'apps/settings/show/views/shortcuts'
], function ($, settingsBehavior, Configs, Shortcuts) {
    'use strict';

    var expect = chai.expect;

    describe('Shortcuts settings view', function () {
        var configs,
            view;

        before(function (done) {
            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            view = new Shortcuts({
                el: $('<div>'),
                collection: configs
            });

            view.render();
            done();
        });

        describe('Instantiated', function () {
            it('ok', function () {
                expect(view).to.be.ok();
                expect(view.collection).to.be.ok();
                expect(view.collection.length > 0).to.be.ok();
            });

            it('has behaviors', function () {
                expect(view.behaviors).to.be.ok();
                expect(view.behaviors.hasOwnProperty('FormBehavior')).to.be.ok();
            });

            it('is not empty', function () {
                expect(view.$el).not.to.be.empty();
                expect(view.$el).to.have('input');
            });
        });

        describe('Triggers events', function () {
            it('collection:new:value when something has changed', function (done) {
                settingsBehavior(view, done);
            });
        });
    });
});
