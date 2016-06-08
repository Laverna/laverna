/*jshint expr: true*/
define([
    'sinon',
    'q',
    'jquery',
    'underscore',
    'backbone.radio',
    'i18next',
    'i18nextXHRBackend',
    'helpers/i18next'
], function(sinon, Q, $, _, Radio, i18n, XHR, helper) {
    'use strict';

    describe('helpers/i18next', function() {
        var sandbox;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('.init()', function() {

            beforeEach(function() {
                sandbox.stub(i18n, 'init');
                sandbox.stub(helper, 'getLang');
            });

            it('adds i18next to jQuery', function() {
                helper.init();
                expect($.t).to.be.a('function');
            });

            it('uses XHR backend', function() {
                sandbox.spy(i18n, 'use');
                helper.init();
                expect(i18n.use).calledWith(XHR);
            });

            it('initializes i18next', function() {
                helper.init();
                expect(i18n.init).called;
            });

            it('calls .getLang()', function() {
                helper.init();
                expect(helper.getLang).called;
            });

        });

        describe('.getLang()', function() {
            var reqStub;

            beforeEach(function() {
                reqStub = sandbox.stub().returns('');
                Radio.reply('configs', 'get:config', reqStub);
            });

            it('requests language from configs', function() {
                reqStub.returns('en_us');
                expect(helper.getLang()).to.be.equal('en_us');
                expect(reqStub).called;
            });

            it('searches language from browser settings', function() {
                sandbox.spy(_, 'chain');
                helper.getLang();
                expect(_.chain).called;
            });

        });

    });

});
