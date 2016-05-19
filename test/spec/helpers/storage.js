/* global define, chai, describe, it, after, before, beforeEach, Modernizr */
define([
    'q',
    'helpers/storage',
    'backbone.radio'
], function(Q, storage, Radio) {
    'use strict';

    var expect = chai.expect;

    function checkFile(needFile, done) {
        storage.switchDb = function(file) {
            expect(file).to.be.equal(needFile);
            done();
        };
    }

    describe('Storage helper', function() {
        var switchDb;

        before(function() {
            switchDb = storage.switchDb;

            if (!window.indexedDB) {
                storage.testDb = function() {
                    return Q.resolve();
                };
            }
        });

        beforeEach(function() {
            Modernizr.indexeddb = true;
            Radio.replyOnce('global', 'use:webworkers', function() { return true; });
        });

        after(function() {
            Modernizr.indexeddb = true;
            storage.switchDb = switchDb;
        });

        it('uses backbone.sync if IndexedDB can be used', function(done) {
            checkFile('backbone.sync', done);
            storage.check();
        });

        it('uses backbone.noworker.sync if IndexedDB can\'t be used', function(done) {
            Modernizr.indexeddb = false;

            checkFile('backbone.noworker.sync', done);
            storage.check();
        });

        it('uses backbone.noworker.sync if WebWorkers can\'t be used', function(done) {
            Radio.replyOnce('global', 'use:webworkers', function() { return false; });

            checkFile('backbone.noworker.sync', done);
            storage.check();
        });

    });
});
