/* global chai, define, describe, before, it */
define([
    'jquery',
    'collections/configs',
    'apps/settings/show/views/profiles'
], function ($, Configs, View) {
    'use strict';

    var expect = chai.expect;

    describe('Profiles settings view', function () {
        var view,
            configs;

        before(function (done) {
            configs = new Configs([{
                name: 'appProfiles',
                value: '[\"notes-db\",\"new\"]'
            }]);

            view = new View({
                el: $('<div>'),
                collection: configs
            });

            view.render();
            done();
        });

        describe('is not empty', function () {
            it('ok', function () {
                expect(view.$el).not.be.empty();
                expect(view.$el).to.have('input');
            });

            it('shows profiles list', function () {
                expect(view.$el).to.have('table');
                expect($('tr', view.$el).length === 4).to.be.ok();
            });

            it('re renders itself if collection has changed', function (done) {
                view.once('render', function () {
                    done();
                });
                view.collection.trigger('change');
            });
        });

        describe('Triggers events', function () {
            it('collection:create:profile', function (done) {
                var e = $.Event('keypress');
                e.which = 13;

                view.collection.once('create:profile', function (name) {
                    expect(name).to.be.equal(view.ui.profileName.val());
                    done();
                });

                view.ui.profileName.val('profileI');
                view.ui.profileName.trigger(e);
            });

            it('collection:remove:profile', function (done) {
                view.collection.once('remove:profile', function (name) {
                    expect(name !== '').to.be.ok();
                    done();
                });

                $('.removeProfile', view.$el).click();
            });
        });
    });
});
