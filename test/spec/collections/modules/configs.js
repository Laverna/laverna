/*jshint expr: true*/
/* global expect, define, describe, before, beforeEach, after, afterEach, it */
define([
    'sinon',
    'q',
    'underscore',
    'sjcl',
    'backbone.radio',
    'collections/modules/configs',
    'collections/modules/module',
], function(sinon, Q, _, sjcl, Radio, colModule, Module) {
    'use strict';

    describe('collections/modules/configs', function() {
        var col,
            defReplies;

        before(function() {

            // Default replies
            defReplies = Module.prototype.reply();
        });

        beforeEach(function() {
            col = _.clone(colModule);
            col.collection = new col.Collection();
            col.collection.resetFromJSON(col.collection.configNames);
        });

        after(function() {
            col.destroy();
        });

        describe('.initialize()', function() {

            it('has .Collection', function() {
                expect(col.Collection.prototype.storeName).to.be.equal('configs');
            });

            it('listens on `.col.storeName` channel', function() {
                expect(col.vent).to.be.an('object');
                expect(col.vent.channelName).to.be.equal(col.Collection.prototype.storeName);
            });

            it('listens to requests', function() {
                _.each(_.union(defReplies, col.reply()), function(reply) {
                    expect(col.vent._requests[reply]).to.be.an('object');
                });
            });

            it('listens to events', function() {
                expect(col.vent._events['destroy:collection']).to.be.an('array');
            });

        });

        describe('.reply()', function() {

            it('returns replies', function() {
                var mReplies = col.reply();

                expect(mReplies).to.be.an('object');
                expect(_.keys(mReplies).length).to.be.equal(8);
            });

        });

        describe('.resetEncrypt()', function() {

            it('empties the value of `encryptBackup` model', function() {
                col.collection.get('encryptBackup')
                    .set('value', {password: '1'});

                col.resetEncrypt();
                expect(_.keys(col.collection.get('encryptBackup').get('value')).length)
                    .to.be.equal(0);
            });

        });

        it('.createProfile()', function() {
            var model = col.collection.get('appProfiles'),
                stub  = sinon.stub(model, 'createProfile');

            col.createProfile(model, 'test');
            expect(stub).calledWith('test');
        });

        describe('.removeProfile()', function() {
            var model;

            beforeEach(function() {
                model = col.collection.get('appProfiles');
                sinon.stub(model, 'removeProfile').returns(Q.resolve());
            });

            afterEach(function() {
                model.removeProfile.restore();
            });

            it('returns a promise', function(done) {
                var res = col.removeProfile(model, 'test---');
                expect(res).to.have.property('promiseDispatch');
                res.should.be.fulfilled.and.notify(done);
            });

            it('triggers `removed:profile` event', function(done) {
                col.vent.once('removed:profile', function(name) {
                    expect(name).to.be.equal('test--1');
                    done();
                });
                col.removeProfile(model, 'test--1');
            });

        });

        describe('.saveModel()', function() {
            var model;

            beforeEach(function() {
                model = new col.collection.model({
                    value: 'hello', name: 'encryptPass'
                });
            });

            it('returns a promise', function() {
                expect(col.saveModel(model, {})).to.have.property('promiseDispatch');
            });

            it('checks if the model stores password', function() {
                var spy = sinon.spy(model, 'isPassword');
                col.saveModel(model, {});
                expect(spy).called;
            });

            it('hashes the password', function(done) {
                Radio.replyOnce('encrypt', 'sha256', function(pass) {
                    expect(pass).to.be.equal('1');
                    done();
                });
                col.saveModel(model, {value: '1'});
            });

        });

        describe('.saveObjects()', function() {

            beforeEach(function() {
                sinon.stub(col, 'saveObject');
            });

            it('returns a promise', function() {
                expect(col.saveObjects({})).to.have.property('promiseDispatch');
            });

            it(
                'saves current encryption configs to a profile\'s backup if' +
                '`useDefaultConfigs` has changed',
                function() {
                    var spy = sinon.spy(col, '_backupEncrypt');
                    col.saveObjects({useDefaultConfigs: true}, {profileId: 'testBackup'});
                    expect(spy).calledWith('testBackup');
                }
            );

            it('backs up encryption configs', function() {
                var spy = sinon.spy(col, '_backupEncryption');
                col.saveObjects({key: '1', key2: '2'}, {profileId: 'testBackup'});
                expect(spy).calledWith({key: '1', key2: '2'});
            });

            it('saves all configs', function() {
                col.saveObjects({key: {name: 'key'}, key2: {name: 'key2'}}, {profileId: 'testDb'});
                expect(col.saveObject).callCount(2);
            });

            it('triggers `changed` event on `configs` channel', function(done) {
                Radio.once('configs', 'changed', function() { done(); });
                col.saveObjects({key: {name: 'key'}, key2: {name: 'key2'}}, {profileId: 'testDb'});
            });

        });

        describe('.saveObject()', function() {

            it('returns a promise', function() {
                expect(col.saveObject({})).to.have.property('promiseDispatch');
            });

            it('calls .getModel()', function() {
                var stub = sinon.stub(col, 'getModel').returns(new Q());
                col.saveObject({name: 'test'});
                expect(stub).calledWith({name: 'test'});
            });

        });

        describe('.getConfig()', function() {

            it('returns the value of a config', function() {
                expect(col.getConfig('firstStart')).to.be.equal('1');
            });

            it('returns the second argument if a config was not found', function() {
                expect(col.getConfig('config404Test', '404')).to.be.equal('404');
            });

        });

        it('.getObject()', function() {
            expect(col.getObject()).to.deep.equal(col.collection.getConfigs());
        });

        describe('.getModel()', function() {

            it('can find by a config name', function() {
                return col.getModel('appVersion').should.eventually.be.an('object');
            });

        });

        describe('.getAll()', function() {

            beforeEach(function() {
            });

            it('returns cached collection if it exists', function() {
                expect(col.collection).to.be.an('object');
                expect(col.getAll()).to.have.property('promiseDispatch');
                return col.getAll().should.eventually.be.equal(col.collection);
            });

        });

        describe('.useDefaultConfigs()', function() {
            var model;

            beforeEach(function() {
                col.getModel = function() { return Q.resolve(model); };
            });

            it('returns null if `useDefaultConfigs` model doesn\'t exist', function() {
                return col.useDefaultConfigs('testDB').should.eventually.be.a('null');
            });

            it('returns null if the value is `1`', function() {
                model = {get: function() { return 1; }};
                return col.useDefaultConfigs('testDB').should.eventually.be.a('null');
            });

            it('returns the profile name otherwise', function() {
                model = {get: function() { return 0; }};
                return col.useDefaultConfigs('testDB').should.eventually.be.equal('testDB');
            });

        });

        describe('.getProfiles()', function() {

            it('returns backup\'s profileId if current profile isn\'t default', function() {
                col.collection.profileId = 'testDB1';
                col.collection.get('encryptBackup').profileId = 'testDB1';
                return col.getProfiles().should.eventually.contain('testDB1');
            });

            it('returns backup\'s profileId if backup uses none default profile', function() {
                col.collection.get('encryptBackup').profileId = 'testDB1';
                return col.getProfiles().should.eventually.contain('testDB1');
            });

            it('returns all profiles which use configs from default profile', function(done) {
                col.getModel = function() { return Q.resolve(); };
                col._getDefaultProfiles = done;
                col.getProfiles();
            });

        });

        describe('._getDefaultProfiles()', function() {
            var model;

            before(function() {
                model = new col.collection.model({
                    name : 'appProfiles',
                    value: JSON.stringify(['notes-db', 'testDb', 'noDefault'])
                });
            });

            beforeEach(function() {
                sinon.stub(col, 'getModel', function(profile) {
                    var m = new col.collection.model();
                    m.set('value', (profile.profile !== 'noDefault' ? 1 : 0));
                    m.profileId = profile.profile;
                    return Q.resolve(m);
                });
            });

            afterEach(function() {
                col.getModel.reset();
            });

            it('returns all profiles which use configs from default profile', function() {
                return col._getDefaultProfiles(model).should.eventually
                    .to.include.members(['notes-db', 'testDb'])
                    .and.not.to.include.members(['noDefault']);
            });

        });

        describe('._checkBackup()', function() {
            var model;

            beforeEach(function() {
                sinon.stub(col, 'getModel', function(options) {
                    expect(options.name).to.be.equal('encryptBackup');
                    if (model) {
                        model.profileId = options.profile;
                    }
                    return Q.resolve(model);
                });
            });

            afterEach(function() {
                col.getModel.reset();
            });

            it('does nothing if it is the default profile', function() {
                return col._checkBackup('testDb').should.eventually.be.an('undefined');
            });

            it('does nothing if backup was not found', function() {
                return col._checkBackup(col.defaultDB).should.eventually.be.an('undefined');
            });

            it('does nothing if backup\'s is not value empty', function() {
                model = new col.collection.model({value: {key: 'value'}});
                return col._checkBackup('testDb').should.eventually.be.an('undefined');
            });

            it('returns current profile\'s encryption backup', function() {
                model = new col.collection.model({value: {}});
                return col._checkBackup('testDb').should.eventually
                    .be.an('object')
                    .and.have.property('profileId').equal('testDb');
            });

        });

        describe('._createDefault()', function() {

            it('does nothing if there aren\'t new configs', function() {
                expect(col.collection.hasNewConfigs()).to.be.equal(false);
                return col._createDefault().should.eventually.be.equal(col.collection);
            });

            it('triggers `collection:empty` event', function(done) {
                col.collection.reset([]);
                col.vent.once('collection:empty', done);
                col._createDefault();
            });

            it('will try to migrate from localStorage', function() {
                var stub = sinon.stub(col.collection, 'migrateFromLocal');
                col.collection.reset([]);
                col._createDefault();
                expect(stub).to.be.called;
            });

            it('will create configs with default values', function(done) {
                col.collection.reset([]);
                col.collection.createDefault = done;
                col._createDefault();
            });

            it('triggers `reset:all` event on collection', function(done) {
                col.collection.reset([]);
                col.collection.createDefault = function() {};

                col.collection.once('reset:all', done);
                col._createDefault();
            });

        });

        describe('._getEncryption()', function() {

            it('returns empty array if encryption config was not provided', function() {
                expect(col._getEncryption({})).to.be.an('array');
                expect(col._getEncryption({})).to.have.length.below(1);
            });

            it('returns empty array if encryption is disabled', function() {
                expect(Number(col.getConfig('encrypt'))).to.be.equal(0);
                expect(col._getEncryption({encrypt: {value: 0}})).to.be.an('array');
                expect(col._getEncryption({encrypt: {value: 0}})).to.have.length.below(1);
            });

            it('disables encryption if password was not provided', function() {
                var data = {encrypt: {value: 1}};

                expect(col.getConfig('encryptPass')).to.have.length.below(1);
                expect(col._getEncryption(data)).to.be.an('array');
                expect(col._getEncryption(data)).to.have.length.below(1);
                expect(data.encrypt.value).to.be.equal('0');
            });

            it('disables encryption if the provided password is empty', function() {
                var data = {encrypt: {value: 1}, encryptPass: {value: ''}};
                expect(col._getEncryption(data)).to.have.length.below(1);
                expect(data.encrypt.value).to.be.equal('0');
            });

            it('returns only encryption configs which changed', function() {
                var data = {
                    encrypt     : {value : 1  , name : 'encrypt'},
                    encryptPass : {value : '1', name : 'encryptPass'},
                    appLang     : {value : 'e', name : 'appLang'}
                };
                expect(col._getEncryption(data)).to.have.length.within(2, 2);
                expect(_.findWhere(col._getEncryption(data), {name: 'encrypt'})).to.have.property('value').equal(1);
                expect(_.findWhere(col._getEncryption(data), {name: 'encryptPass'})).to.have.property('value').equal('1');
            });

        });

        describe('._checkPassChanged()', function() {

            it('returns true if name is not equal `encryptPass`', function() {
                expect(col._checkPassChanged({name: 'encrypt'})).to.be.equal(true);
            });

            it('returns false if new and old passwords are equal', function() {
                col.collection.get('encryptPass').set('value', '1');
                expect(col._checkPassChanged({name: 'encryptPass', value: '1'})).to.be.equal(false);
            });

            it('returns false if password hashes are not different', function() {
                col.collection.get('encryptPass').set('value', sjcl.hash.sha256.hash('1'));
                expect(col._checkPassChanged({name: 'encryptPass', value: '1'})).to.be.equal(false);
            });

            it('returns true if password hashes are different', function() {
                col.collection.get('encryptPass').set('value', sjcl.hash.sha256.hash('2'));
                expect(col._checkPassChanged({name: 'encryptPass', value: '1'})).to.be.equal(true);
            });

        });

        describe('._backupEncrypt()', function() {

            it('backs up all current encryption configs', function() {
                sinon.stub(col, 'saveModel', function(model, data) {
                    model.set(data);
                    return model;
                });

                return col._backupEncrypt('test')
                .then(function(model) {
                    expect(model.profileId).to.be.equal('test');
                    expect(model.get('value'))
                        .to.deep.equal(_.pick(col.collection.getConfigs(), col.encryptionKeys));
                });
            });

        });

        describe('._backupEncryption()', function() {

            it('does nothing if encryption configs haven\'t changed', function() {
                expect(col._backupEncryption({})).to.be.an('undefined');
            });

            it('does nothing if encryption backup is not empty', function() {
                var data = {encrypt: {value: 1, name: 'encrypt'}};
                col.collection.get('encryptBackup').set('value', {key: '1'});
                col.collection.get('encryptPass').set('value', '1');

                expect(col._backupEncryption(data)).to.be.an('undefined');
                expect(data.encrypt.value).to.be.equal(1);
            });

            it('saves changed encryption configs to backup', function() {
                var data = {
                    encrypt     : {value : 1  , name : 'encrypt'},
                    encryptPass : {value : '1', name : 'encryptPass'},
                };
                expect(col._backupEncryption(data)).to.be.an('object');
                expect(col._backupEncryption(data).encryptBackup)
                    .to.have.property('value')
                    .deep.equal(_.pick(col.getObject(), ['encrypt', 'encryptPass']));
            });

            it('does not back up encryption password if it has not changed', function() {
                var data = {
                    encrypt     : {value : 1  , name : 'encrypt'},
                    encryptPass : {value : '1', name : 'encryptPass'},
                };
                col.collection.get('encryptPass').set('value', '1');

                expect(col._backupEncryption(data).encryptBackup)
                    .to.have.property('value')
                    .deep.equal(_.pick(col.getObject(), ['encrypt']));
            });

        });

    });

});
