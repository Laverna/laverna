/* global define, describe, it, expect, before, after */
define([
    'underscore',
    'i18next',
    'backbone',
    'backbone.radio',
    'app',
    'marionette'
], function(_, i18n, Backbone, Radio, App) {
    'use strict';

    describe('app', function() {

        before(function() {
            Backbone.history.stop();
        });

        after(function() {
            Backbone.history.stop();
        });

        describe('Object', function() {

            it('is an object', function() {
                expect(App).to.be.an('object');
            });

            it('is instance of Marionette.Application', function() {
                expect(App).to.be.instanceof(Backbone.Marionette.Application);
            });

            it('has "startSubApp" method', function() {
                expect(App.startSubApp).to.be.a('function');
            });

        });

        describe('.startSubApp()', function() {
            var apps;

            before(function() {
                apps = {};
                apps.test = App.module('AppTest', {startWithParent: false});
                apps.test2 = App.module('AppTest2', {startWithParent: false});
            });

            it('can start a sub app', function(done) {
                apps.test.once('before:start', function(args) {
                    expect(args.myArg).to.be.equal(true);
                    done();
                });
                App.startSubApp('AppTest', {myArg: true});
            });

            it('currentApp changes', function() {
                expect(App.currentApp).to.be.equal(apps.test);
            });

            it('it will not start the same subApp again', function() {
                expect(App.currentApp).to.be.equal(apps.test);
                expect(App.startSubApp('AppTest')).not.to.be.equal(true);
            });

            it('stops previous app if current app is not modal', function(done) {
                expect(App.currentApp).to.be.equal(apps.test);
                expect(App.currentApp.options.modal).not.to.be.equal(true);

                apps.test.once('stop', done);
                expect(App.startSubApp('AppTest2')).to.be.equal(true);
            });

        });

        describe('overwrites Marionette renderrer', function() {
            var render;

            before(function(done) {
                render = Backbone.Marionette.Renderer.render;
                i18n.init({}, function() { done(); });
            });

            it('has i18n method', function() {
                expect(render(_.template('{{i18n("key")}}')))
                    .to.be.equal('key');
            });

            it('has cleanXSS method', function() {
                expect(render(_.template('{{cleanXSS("Hello")}}')))
                    .to.be.equal('Hello');
            });

            it('has stripTags method', function() {
                expect(render(_.template('{{stripTags("<b>Hello</b>")}}')))
                    .to.be.equal('Hello');
            });

        });

        describe('Replies', function() {

            it('`app:current` returns current subApp', function() {
                var sApp = App.module('AppTesting', {startWithParent: false});
                App.startSubApp('AppTesting');
                expect(Radio.request('global', 'app:current')).to.be.equal(sApp);
            });

            it('`device` executes Device method', function() {
                expect(Radio.request('global', 'device', 'mobile'))
                    .to.be.equal(false);
            });

            it('`platform`', function() {
                expect(Radio.request('global', 'platform')).to.be.a('string');
            });

            it('`use:webworkers`', function() {
                expect(typeof Radio.request('global', 'use:webworkers'))
                    .to.be.equal('boolean');
            });

        });

        describe('Events', function() {

            it('triggers `app:init` on `before:start`', function(done) {
                Radio.once('global', 'app:init', done);
                App.trigger('before:start');
            });

            it('triggers `app:start` on `start`', function(done) {
                Radio.once('global', 'app:start', done);
                App.trigger('start');
            });

        });

    });
});
