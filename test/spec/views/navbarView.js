/* global chai, define, describe, before, it */
define([
    'require',
    'jquery',
    'collections/configs',
    'collections/notebooks',
    'apps/navbar/show/view'
], function (require, $, Configs, Notebooks, NavbarView) {
    'use strict';

    var expect = chai.expect;

    describe('Navbar view', function () {
        var view;

        before(function () {
            view = new NavbarView({
                el: $('<div>'),
                settings: Configs.prototype.configNames,
                notebooks: null,
                args: {},
            });
            view.render();
        });

        describe('instantiated', function () {
            it('should exist', function () {
                expect(view).to.be.ok();
            });
        });

        describe('Triggers events', function () {
            it('syncWithCloud event', function (done) {
                view.on('syncWithCloud', function () {
                    done();
                });
                view.ui.syncBtn.click();
            });

            it('view:navigate when a form was submitted', function (done) {
                view.on('navigate', function () {
                    done();
                });
                view.ui.navbarSearchForm.trigger('submit');
            });
        });

        describe('Shows sync status', function () {
            it('"sync:before" event', function (done) {
                view.on('sync:before', function () {
                    expect(view.ui.syncStatus).to.have.class('animate-spin');
                    done();
                });
                view.trigger('sync:before');
            });

            it('"sync:after" event', function (done) {
                view.on('sync:after', function () {
                    expect(view.ui.syncStatus).not.to.have.class('animate-spin');
                    done();
                });
                view.trigger('sync:after');
            });
        });

        describe('Search form', function () {
            it('is invisible', function () {
                expect(view.ui.navbarSearchForm).to.have.class('hidden');
            });

            describe('will appear', function () {
                it('if user hits search button', function (done) {
                    $('.btn-search', view.$el).click();
                    setTimeout(function () {
                        expect(view.ui.navbarSearchForm).not.to.have.class('hidden');
                        done();
                    }, 100);
                });
            });
        });
    });

});
