/* global chai, define, describe, before, it */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'collections/configs',
    'collections/notebooks',
    'apps/navbar/show/view'
], function(_, $, Radio, Configs, Notebooks, NavbarView) {
    'use strict';

    var expect = chai.expect;

    describe('Navbar view', function() {
        var view,
            configs;

        before(function() {
            configs = new Configs();
            configs.resetFromJSON(_.extend({}, configs.configNames, {cloudStorage: 'dropbox'}));

            view = new NavbarView({
                el         : $('<div>'),
                collection : configs,
                profiles   : configs.get('appProfiles'),
                notebooks  : new Notebooks(),
                args       : {},
            });

            view.render();
        });

        describe('instantiated', function() {
            it('should exist', function() {
                expect(view instanceof NavbarView).to.be.equal(true);
            });
        });

        describe('Triggers events', function() {

            it('`sync`:`start` event', function(done) {
                Radio.replyOnce('sync', 'start', function() {
                    done();
                });
                view.$('#header--sync').trigger('click');
            });

            it('`search:hidden` after search form is submitted', function(done) {
                Radio.once('global', 'search:hidden', function() {
                    done();
                });
                view.$('#header--search').trigger('submit');
            });

            it('`search:submit` after search form is submitted and text is not empty', function(done) {
                view.once('search:submit', function() {
                    done();
                });
                view.ui.search.val('Test');
                view.$('#header--search').trigger('submit');
            });

        });

        describe('Shows sync status', function() {

            it('`sync`:`start` event', function(done) {
                Radio.once('sync', 'start', function() {
                    expect(view.ui.sync).to.have.class('animate-spin');
                    done();
                });
                Radio.trigger('sync', 'start');
            });

            it('`sync`:`stop` event', function(done) {
                Radio.once('sync', 'stop', function() {
                    expect(view.ui.sync).not.to.have.class('animate-spin');
                    done();
                });
                Radio.trigger('sync', 'stop');
            });
        });

        describe('Search form', function() {

            it('is invisible', function() {
                expect(view.$('#sidebar--nav').hasClass('-search')).to.equal(false);
            });

            it('will appear if the search button is clicked', function(done) {
                Radio.once('global', 'search:shown', function() {
                    expect(view.$('#sidebar--nav').hasClass('-search')).to.equal(true);
                    done();
                });

                view.$('#header--sbtn').click();
            });

        });
    });

});
