/*jshint expr: true*/
/* global define, describe, it, expect, before, after */
define([
    'sinon',
    'underscore',
    'backbone.radio',
    'moduleLoader'
], function(sinon, _, Radio, Loader) {
    'use strict';

    describe('moduleLoader', function() {

        after(function() {
            Radio.request('init', 'add', 'load:modules', function() {});
        });

        describe('Object', function() {

            it('is an object', function() {
                expect(Loader).to.be.an('object');
            });

            it('has functions', function() {
                _.each(['init', 'load', 'get'], function(name) {
                    expect(Loader).to.have.property(name);
                    expect(Loader[name]).to.be.a('function');
                });
            });

        });

        describe('.init()', function() {

            it('calls load function', function() {
                var load = sinon.stub(Loader, 'load');
                Loader.init();
                expect(load).to.have.been.called;
            });

            it('replies to `modules` request on global channel', function() {
                expect(Radio.request('global', 'modules')).to.be.an('array');
            });

        });

        describe('.get()', function() {
            var configs;

            before(function() {
                configs = {modules: ['mathjax', 'fuzzySearch']};

                Radio.reply('configs', 'get:config', function(key) {
                    return configs[key];
                });
            });

            after(function() {
                Radio.stopReplying('configs', 'get:config');
            });

            it('returns array of modules', function() {
                expect(Loader.get()).to.be.an('array');
                expect(Loader.get().length).to.be.equal(configs.modules.length);
            });

            it('includes sync adapter', function() {
                _.each(['dropbox', 'remotestorage'], function(adapter) {
                    configs.cloudStorage = adapter;

                    expect(Loader.get().length).to.be.equal(configs.modules.length + 1);
                    expect(Loader.get()).to.include.members(['modules/' + adapter + '/module']);
                });
            });

            it('does not load none existent module', function() {
                configs.cloudStorage = null;
                configs.modules.push('module404');

                expect(Loader.get().length).not.to.be.equal(configs.modules.length);
                expect(Loader.get().length).to.be.equal(configs.modules.length - 1);
            });

        });

    });

});
