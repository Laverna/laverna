/* global define, chai, describe, it, Modernizr */
define([
    'helpers/storage',
    'backbone',
    'backbone.wreqr'
], function(Storage, Backbone) {
    'use strict';

    var expect = chai.expect,
        channel = Backbone.Wreqr.radio.channel('global');

    describe('Storage helper', function() {
        it('has "storage" response', function() {
            var storage = channel.reqres.request('storage');
            expect(storage).to.be.equal('indexeddb');
        });

        it('should use indexeddb if it is available', function(done) {
            Modernizr.indexeddb = true;
            Storage.check().then(function() {
                expect(Storage.storage).to.be.equal('indexeddb');
                done();
            });
        });

        it('should use websql if indexeddb is not available', function(done) {
            Modernizr.indexeddb = false;
            Modernizr.websqldatabase = true;
            window.shimIndexedDB = { __useShim: function() {} };

            Storage.check().then(function() {
                expect(Storage.storage).to.be.equal('websql');
                done();
            });
        });

        it(
            'should use localstorage if neither indexeddb nor websql are available',
            function(done) {
                Modernizr.indexeddb = false;
                Modernizr.websqldatabase = false;

                Storage.check().then(function() {
                    expect(Storage.storage).to.be.equal('localstorage');
                    done();
                });
            }
        );

        it('should fail if it doesn\'t support web storages', function(done) {
            Modernizr.indexeddb = false;
            Modernizr.websqldatabase = false;
            Modernizr.localstorage = false;

            Storage.check().fail(function() {
                expect(Storage.storage).to.be.equal(null);
                done();
            });
        });

        describe('Events', function() {
            it('should trigger "storage:error" event', function(done) {
                channel.vent.on('storage:error', done);
                Storage.check();
            });

            it('should trigger "storage:local" event', function(done) {
                Modernizr.localstorage = true;
                channel.vent.on('storage:local', done);
                Storage.check();
            });
        });
    });
});
