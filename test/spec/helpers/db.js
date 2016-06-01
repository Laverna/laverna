/* global define, describe, it, expect, before, after */
define([
    'q',
    'underscore',
    'helpers/db'
], function(Q, _, db) {
    'use strict';

    describe('helpers/db', function() {
        var options;

        this.timeout(8000);

        before(function() {
            options = {profile: 'test-lav', storeName: 'notes'};
        });

        after(function() {
            db.dbs = {};
            window.indexedDB.deleteDatabase('test-lav');
        });

        describe('.getDB()', function() {

            it('returns a localForage instance', function() {
                var dbInstance = db.getDb(options);
                expect(dbInstance).to.be.an('object');
                expect(dbInstance.INDEXEDDB).to.be.equal('asyncStorage');
            });

            it('caches an instance to `dbs` variable', function() {
                var dbId = options.profile + '/notebooks';
                expect(db.dbs[dbId]).to.be.an('undefined');
                db.getDb({profile: options.profile, storeName: 'notebooks'});
                expect(db.dbs[dbId]).to.be.an('object');
            });

        });

        describe('.find()', function() {

            it('returns a promise', function() {
                expect(db.find({id: 'random', options: options}))
                    .to.have.property('promiseDispatch');
            });

            it('fails if an item was not found', function(done) {
                return db.find({id: '404data', options: options})
                    .should.be.rejectedWith('not found')
                    .and.notify(done);
            });

            it('can find an item', function(done) {
                new Q(db.getDb(options).setItem('testId', {content: 'hello'}))
                .then(function() {
                    return db.find({id: 'testId', options: options});
                })
                .then(function(data) {
                    expect(data).to.be.an('object');
                    expect(data.content).to.be.equal('hello');
                    done();
                });
            });

        });

        describe('.findAll()', function() {

            before(function(done) {
                Q.all([
                    db.getDb(options).setItem('testId-1', {content: 'hello'}),
                    db.getDb(options).setItem('testId-2', {content: 'hello'})
                ]).then(function() { done(); });
            });

            it('returns a promise', function() {
                expect(db.findAll({options: options})).to.have.property('promiseDispatch');
            });

            it('resolves with empty array if DB is empty', function() {
                return db.findAll({options: {profile: options.profile, storeName: 'tags'}})
                    .should.eventually.have.property('length').equal(0);
            });

            it('resolves with data if items were found', function() {
                return db.findAll({options: options}).should.eventually
                    .have.property('length').least(1);
            });

        });

        describe('.findByKeys', function() {

            before(function(done) {
                Q.all([
                    db.getDb(options).setItem('key1', {key: true, content: 'hello'}),
                    db.getDb(options).setItem('key2', {key: false, content: 'hello'})
                ]).then(function() { done(); });
            });

            it('returns a promise', function() {
                expect(db.findByKeys(['key1', 'key2'], {options: options}))
                    .to.have.property('promiseDispatch');
            });

            it('can find items with provided keys', function() {
                return db.findByKeys(['key1', 'key2'], {options: options})
                    .should.eventually.have.property('length').equal(2);
            });

            it('can filter items', function() {
                return db.findByKeys(['key1', 'key2'], {options: {
                    conditions : {key: true},
                    profile    : options.profile,
                    storeName  : options.storeName
                }}).should.eventually.have.property('length').equal(1);
            });

        });

        describe('.save()', function() {
            var opt;

            before(function() {
                opt = _.extend({encryptKeys: ['content', 'secret']}, options);
            });

            it('returns a promise', function() {
                expect(db.save({options: options, id: 'save1', data: {}}))
                    .to.have.property('promiseDispatch');
            });

            it('saves an item', function(done) {
                db.save({options: options, id: 'save2', data: {key: 'hello'}})
                .then(function() {
                    return db.find({options: options, id: 'save2'});
                })
                .then(function(data) {
                    expect(data.key).to.be.equal('hello');
                    done();
                });
            });

            it('omits all encryptKeys if .encryptedData is not empty', function(done) {
                var data = {
                    content       : 'hello',
                    secret        : 'world',
                    disclosed     : 'data',
                    encryptedData : 'encrypted data'
                };

                db.save({options: opt, id: 'save3', data: data})
                .then(function() {
                    return db.find({options: options, id: 'save3'});
                })
                .then(function(sData) {
                    expect(_.keys(sData).length).to.be.equal(2);
                    expect(sData.content).to.be.an('undefined');
                    done();
                });
            });

        });

    });

});
