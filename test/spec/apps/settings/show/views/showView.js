/* global chai, define, describe, before, it */
define([
    'underscore',
    'jquery',
    'collections/configs',
    'apps/settings/show/views/showView',
    'apps/settings/show/views/basic',
    'apps/settings/show/views/shortcuts',
    'apps/settings/show/views/importExport',
    'apps/settings/show/views/profiles',
], function (_, $, Configs, View, Basic, Shortcuts, Import, Profiles) {
    'use strict';

    var expect = chai.expect;

    describe('Settings view', function () {
        var view,
            configs;

        before(function (done) {
            configs = new Configs();
            configs.resetFromJSON(Configs.prototype.configNames);

            view = new View({
                el: $('<div>'),
                collection : configs,
                args: {}
            });

            view.render();
            done();
        });

        describe('instantiated', function () {
            it('should exist', function () {
                expect(view).to.be.ok();
            });

            it('has property "stayOnHashchange"', function () {
                expect(view.stayOnHashchange === true).to.be.ok();
            });
        });

        describe('Tabs', function () {
            function checkInstance (TabView, done, tab) {
                view.content.once('before:show', function (view) {
                    expect(view instanceof TabView).to.be.ok();
                    done();
                });
                view.trigger('show:tab', {tab: tab});
            }

            it('has content region', function () {
                expect(view.content).to.be.ok();
            });

            it('shows basic tab when there is no argument', function (done) {
                checkInstance(Basic, done);
            });

            it('shows profiles tab', function (done) {
                checkInstance(Profiles, done, 'profiles');
            });

            it('shows importExport tab', function (done) {
                checkInstance(Import, done, 'other');
            });

            it('shows shortcuts tab', function (done) {
                checkInstance(Shortcuts, done, 'shortcuts');
            });
        });

        describe('Triggers events', function () {
            function triggerTab (name, done) {
                view.once('show:tab', function (args) {
                    expect(args.tab).to.be.equal(name);
                    done();
                });
                $('.modal-header ul a[href="#' + name + '"]', view.$el).click();
            }

            describe('Tab events', function () {
                it('view:show:tab and shows basic tab', function (done) {
                    triggerTab('basic', done);
                });

                it('view:show:tab and shows shortcuts tab', function (done) {
                    triggerTab('shortcuts', done);
                });

                it('view:show:tab and shows import tab', function (done) {
                    triggerTab('other', done);
                });

                it('view:show:tab and shows profiles tab', function (done) {
                    triggerTab('profiles', done);
                });
            });

            it('view:redirect', function (done) {
                view.once('redirect', function () {
                    done();
                });
                view.trigger('hidden.modal');
            });

            it('collection:save:all when user hits "Save"', function (done) {
                view.collection.once('save:all', function () {
                    done();
                });
                $('.ok', view.$el).click();
            });

            it('view:close when user hits "Cancel"', function (done) {
                view.once('close', function () {
                    done();
                });
                $('.cancelBtn', view.$el).click();
            });
        });
    });
});
