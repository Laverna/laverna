/* global chai, define, describe, before, after, it */
define([
    'underscore',
    'apps/encryption/auth',
    'apps/encryption/encrypt/modelEncrypt'
], function (_, getAuth, getEncrypt) {
    'use strict';

    // Right now this Unit test doesn't work without indexedDB
    if (navigator.userAgent.indexOf('PhantomJS') > 0) {
        return;
    }

    var expect = chai.expect,
        settings = {'encrypt': 1, 'encryptPass': [1803989619,-13304607,-1653899186,-10862761,1202562282,-1573970615,-1071754531,-1215866037], 'encryptSalt': '-1741709422,-1683544510', 'encryptIter': '1000','encryptTag': '64', 'encryptKeySize': '128'};

    describe('Encryption test', function () {
        var auth;

        before(function () {
            auth = getAuth(settings);
        });

        describe('Instance', function () {

            it('is singletone', function (done) {
                require(['apps/encryption/auth'], function (getAuthInstance) {
                    auth.secureKey = 'new key';
                    expect(auth === getAuthInstance()).to.be.equal(true);
                    expect(getAuthInstance().settings).to.be.equal(auth.settings);
                    expect(getAuthInstance().secureKey).to.be.equal(auth.secureKey);
                    done();
                });
            });

        });

        describe('Session storage', function () {

            it('can save data to sessionStorage', function () {
                var key = 'test key ' + _.uniqueId();
                auth.saveKey(key);
                expect(auth.getKey()).to.be.equal(key);
            });

        });

        describe('Auth', function () {

            it('can save secureKey to sessionStorage', function () {
                var key = auth.getSecureKey('1').toString();
                expect(auth.getKey().toString()).to.be.equal(key);
            });

            it('properly checks authorization', function () {
                expect(auth.checkAuth()).to.be.equal(true);

                // Get secureKey from sessionStorage
                auth.secureKey = null;
                expect(auth.checkAuth()).to.be.equal(true);

                auth.destroyKey();
                expect(auth.checkAuth()).to.be.equal(false);
            });

        });

        describe('Encryption', function () {
            var value = '24';

            it('can encrypt the data', function () {
                auth.getSecureKey('1');
                expect(auth.encrypt(value) === value).to.be.equal(false);
            });

            it('can decrypt an encrypted data', function () {
                var encrypted = auth.encrypt(value);
                expect(encrypted === value).to.be.equal(false);
                expect(auth.decrypt(encrypted) === value).to.be.equal(true);
            });

        });

        describe('Reencryption', function () {
            var settingsNew = _.extend(_.clone(settings), { encryptKeySize: '256', encrypt: 0}),
                notes,
                encrypt;

            this.timeout(10000);

            function getJSON (data, key) {
                key = key || 'title';
                try {
                    return JSON.parse(data.get(key));
                }
                catch (e) {
                    return data.get(key);
                }
            }

            before(function (done) {
                encrypt = getEncrypt(settingsNew, settings);

                encrypt.checkPassword('1', 'configsOld');
                encrypt.checkPassword('1', 'configs');

                require(['collections/notes'], function (Notes) {
                    notes = new Notes();
                    notes.database.getDB('unittest');

                    for (var i = 0; i <= 10; i++) {
                        notes.create(new notes.model({
                            id: i,
                            title: 'Note #' + i,
                            content: 'Content of note #' + i
                        }));
                    }
                    done();
                });
            });

            after(function () {
                window.indexedDB.deleteDatabase('unittest');
            });

            it('collection is not empty', function () {
                expect(notes.length > 0).to.be.equal(true);
            });

            it('can encrypt data', function (done) {
                encrypt.configsOld.encrypt = 0;
                encrypt.configs.encrypt = 1;

                $.when(encrypt.initialize([notes])).then(function () {
                    var note = getJSON(notes.at(0));

                    expect(typeof note).to.be.equal('object');
                    expect(typeof notes.at(0).decrypt().title).to.be.equal('string');
                    done();
                });
            });

            it('can decrypt data', function (done) {
                encrypt.configsOld = settingsNew;
                encrypt.configs = settings;

                encrypt.configsOld.encrypt = 1;
                encrypt.configs.encrypt = 0;

                $.when(encrypt.initialize([notes])).done(function () {
                    var note = getJSON(notes.at(0));

                    expect(typeof note).to.be.equal('string');
                    done();
                });
            });

            it('reencrypts the data when an encryption settings have been changed', function (done) {
                encrypt.configsOld = settings;
                encrypt.configs = settingsNew;

                encrypt.configsOld.encrypt = 0;
                encrypt.configs.encrypt = 1;

                function reEncrypt () {
                    encrypt.configsOld.encrypt = 1;
                    encrypt.configs.encrypt = 1;
                    encrypt.configs.encryptKeySize = '256';

                    $.when(encrypt.initialize([notes])).done(function () {
                        var note = getJSON(notes.at(0));
                        expect(typeof note).to.be.equal('object');
                        expect(typeof notes.at(0).decrypt().title).to.be.equal('string');
                        done();
                    });
                }

                $.when(encrypt.initialize([notes])).done(reEncrypt);
            });
        });

    });

});
