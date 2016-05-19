/* global chai, define, describe, before, it */
define([
    'jquery',
    'spec/apps/settings/show/formBehavior',
    'collections/configs',
    'apps/settings/show/views/keybindings'
], function($, settingsBehavior, Configs, Shortcuts) {
    'use strict';

    var expect = chai.expect;

    describe('Shortcuts settings view', function() {
        var configs,
            view;

        before(function(done) {
            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            view = new Shortcuts({
                el: $('<div>'),
                collection: configs
            });

            view.render();
            done();
        });

        describe('Instantiated', function() {
            it('ok', function() {
                expect(view instanceof Shortcuts).to.be.equal(true);
                expect(view.collection instanceof Configs).to.be.equal(true);
                expect(view.collection.length > 0).to.be.equal(true);
            });

            it('has behaviors', function() {
                expect(typeof view.behaviors).to.be.equal('object');
                expect(view.behaviors.hasOwnProperty('FormBehavior')).to.be.equal(true);
            });

            it('is not empty', function() {
                expect(view.$el).not.to.be.empty();
                expect(view.$el).to.have('input');
            });
        });

        describe('Triggers events', function() {
            it('collection:new:value when something has changed', function(done) {
                settingsBehavior(view, done);
            });
        });
    });
});
