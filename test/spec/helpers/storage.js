/*jshint expr: true*/
/* global define, expect, describe, it, beforeEach, afterEach, Modernizr */
define([
    'sinon',
    'q',
    'underscore',
    'backbone',
    'backbone.radio',
    'helpers/storage'
], function(sinon, Q, _, Backbone, Radio, storage) {
    'use strict';

    describe('helpers/storage', function() {

        describe('.check()', function() {

            beforeEach(function() {
                sinon.stub(storage, 'switchDb');
                sinon.stub(storage, 'testDb');

                Radio.reply('global', 'use:webworkers', function() { return true; });
            });

            afterEach(function() {
                storage.switchDb.restore();
                storage.testDb.restore();

                Modernizr.indexeddb = true;
            });

            it('uses backbone.noworker.sync if IndexedDB can\'t be used', function() {
                Modernizr.indexeddb = false;
                storage.check();
                expect(storage.switchDb).to.have.been.calledWith('backbone.noworker.sync');
            });

            it('uses backbone.noworker.sync if WebWorkers can\'t be used', function() {
                Radio.replyOnce('global', 'use:webworkers', function() { return false; });
                storage.check();
                expect(storage.switchDb).to.have.been.calledWith('backbone.noworker.sync');
            });

            it('uses backbone.sync', function() {
                storage.testDb.returns(Q.resolve());

                return storage.check().then(function() {
                    expect(storage.switchDb).to.have.been.calledWith('backbone.sync');
                });
            });

            it('uses backbone.noworker.sync if .testDb() fails', function() {
                storage.testDb.returns(Q.reject());

                return storage.check().then(function() {
                    expect(storage.switchDb).to.have.been.calledWith('backbone.noworker.sync');
                });
            });

        });

        describe('.testDb()', function() {

            it('returns a promise', function() {
                expect(storage.testDb()).to.have.property('promiseDispatch');
            });

            it('successfully opens the DB', function(done) {
                return storage.testDb().should.be.fulfilled.and.notify(done);
            });

        });

        describe('.switchDb()', function() {

            it('overwrites Backbone.sync with the provided adapter', function(done) {
                var sync = Backbone.sync;

                storage.switchDb('backbone.noworker.sync').then(function() {
                    expect(Backbone.sync).not.to.be.equal(sync);
                    Backbone.sync = sync;
                    done();
                });
            });

        });

    });
});
