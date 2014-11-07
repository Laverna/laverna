/* global define, chai, describe, before, after, it */
define([
    'backbone',
    'helpers/configs',
    'collections/configs',
    'backbone.wreqr',
    'localStorage'
], function(Backbone, Configs, Collection) {
    'use strict';

    var expect = chai.expect,
        store = new Backbone.LocalStorage('unittest.configs'),
        channel = Backbone.Wreqr.radio.channel('global');

    describe('Configs helper', function() {
        before(function() {
            Collection.prototype.localStorage = store;
        });

        after(function() {
            store._clear();
        });

        it('is an object', function() {
            expect(typeof Configs).to.be.equal('object');
        });

        it('triggers app:install event if collection was empty', function(done) {
            channel.vent.on('app:install', done);
            Configs.fetch();
        });

        it('responds to "configs" request', function() {
            var configs = channel.reqres.request('configs', true);
            expect(typeof configs).to.be.equal('object');
        });

        it('responds to "constants" request', function() {
            var constants = channel.reqres.request('constants');
            expect(typeof constants).to.be.equal('object');
        });
    });
});
