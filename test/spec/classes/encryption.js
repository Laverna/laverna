/* global define, requirejs, describe, before, beforeEach, after, afterEach, chai, it */
define(function(require) {
    'use strict';

    var _       = require('underscore'),
        Q       = require('q'),
        Radio   = require('backbone.radio'),
        sjcl    = require('sjcl'),
        Encrypt = require('classes/encryption'),
        expect  = chai.expect,
        helpers = require('spec/classes/helpers'),
        configs,
        encrypt,
        keys;

    function setKey(callback) {
        encrypt.saveSecureKey('1')
        .then(function() {
            keys = encrypt.keys;
            callback();
        })
        .fail(function(e) {
            console.error('Error:', e);
        });
    }

    function requirePromise(name) {
        var defer = Q.defer();
        requirejs([name], function(res) {
            defer.resolve(res);
        });
        return defer.promise;
    }

    function encryptModel(name) {
        return requirePromise('models/' + name)
        .then(function(model) {
            model = new model({id: 'random'}); // jshint ignore:line

            _.each(model.encryptKeys, function(key) {
                model.set(key, 'random ' + key);
            });

            return encrypt.encryptModel(model)
            .then(function() {
                _.each(model.encryptKeys, function(key) {
                    model.set(key, 'not random ' + key);
                });

                expect(typeof sjcl.json.decode(model.get('encryptedData'))).to.be.equal('object');
                return model;
            });
        });
    }

    function decryptModel(model) {
        return encrypt.decryptModel(model)
        .then(function() {
            _.each(model.encryptKeys, function(key) {
                expect(model.get(key)).to.be.equal('random ' + key);
                expect(model.get(key).match(/^\{.*\}$/)).not.to.be.equal(true);
            });
        });
    }

    function encryptModels(name) {
        return requirePromise('collections/' + name)
        .then(function(Collection) {
            var collection = new Collection(),
                keys       = Collection.prototype.model.prototype.encryptKeys;

            function createData(i) {
                var data = {};
                _.each(keys, function(key) {
                    data[key] = 'Random ' + key + ' ' + i;
                });
                return data;
            }

            for (var i = 0; i < 20; i++) {
                collection.add(createData(i));
            }

            return encrypt.encryptModels(collection).thenResolve(collection);
        })
        .then(function(collection) {
            collection.each(function(model) {
                expect(typeof sjcl.json.decode(model.get('encryptedData'))).to.be.equal('object');

                _.each(keys, function(key) {
                    model.set(key, '{"string": "string"}');
                });
            });
            return collection;
        });
    }

    function decryptModels(collection) {
        return encrypt.decryptModels(collection)
        .then(function() {
            collection.each(function(model) {
                _.each(model.encryptKeys, function(key) {
                    expect(typeof model.get(key)).to.be.equal('string');
                    expect(model.get(key).match(/^\{.*\}$/)).not.to.be.equal(true);
                });
            });
            return;
        });
    }

    describe('classes/encryption.js', function() {

        beforeEach(function() {
            configs = {
                'encrypt'        : '1',
                'encryptPass'    : sjcl.hash.sha256.hash('1'),
                'encryptSalt'    : sjcl.random.randomWords(5, 0),
                'encryptIter'    : '1000',
                'encryptTag'     : '64',
                'encryptKeySize' : '128',
            };

            Radio.reply('configs', 'get:object', configs);
            encrypt = new Encrypt();
        });

        after(function() {
            Radio.stopReplying('configs', 'get:object');
        });

        it('is an object', function() {
            expect(typeof encrypt).to.be.equal('object');
        });

        it('uses configs', function() {
            expect(typeof encrypt.configs).to.be.equal('object');
            expect(_.isEqual(encrypt.configs, configs)).to.be.equal(true);
        });

        describe('randomize()', function() {

            it('exists', function() {
                expect(typeof encrypt.randomize).to.be.equal('function');
            });

            it('returns a string', function() {
                expect(typeof encrypt.randomize(5, 0)).to.be.equal('string');
            });

            it('uses "number" parameter', function() {
                expect(encrypt.randomize(1, 0).length).to.be.equal(8);
                expect(encrypt.randomize(2, 0).length).to.be.equal(8 * 2);
                expect(encrypt.randomize(5, 0).length).to.be.equal(8 * 5);
            });
        });

        describe('changeConfigs()', function() {
            var old;

            beforeEach(function() {
                old = _.clone(configs);
            });

            it('uses new configs', function() {
                configs.encrypt = 0;
                encrypt.changeConfigs(configs);

                expect(_.isEqual(old, encrypt.configs)).to.be.equal(false);
                expect(encrypt.configs.encrypt).to.be.equal(0);
            });

            it('extends from the previous configs', function() {
                configs.encrypt     = 1;
                configs.encryptIter = 2000;

                encrypt.changeConfigs(configs);

                expect(encrypt.configs.encrypt).to.be.equal(1);
                expect(encrypt.configs.encryptIter).to.be.equal(2000);

                expect(_.isEqual(
                    _.omit(old, 'encrypt', 'encryptIter'),
                    _.omit(encrypt.configs, 'encrypt', 'encryptIter')
                )).to.be.equal(true);
            });

        });

        describe('checkAuth()', function() {

            afterEach(function() {
                encrypt.configs = configs;
            });

            it('returns false if the user is not authorized', function() {
                encrypt.keys = {};
                if (window.sessionStorage) {
                    window.sessionStorage.clear();
                }

                expect(encrypt.checkAuth()).to.be.equal(false);
            });

            it('returns true if encryption is disabled', function() {
                encrypt.configs.encrypt = 0;
                expect(encrypt.checkAuth()).to.be.equal(true);
            });

            it('returns true if encryption password is empty', function() {
                encrypt.configs.encryptPass = '';
                expect(encrypt.checkAuth()).to.be.equal(true);
            });

            it('returns {isChanged:true} if encryption settings have changed', function() {
                encrypt.configs.encryptBackup = {encryptPass: ''};

                var res = encrypt.checkAuth();
                expect(typeof res).to.be.equal('object');
                expect(res.isChanged).to.be.equal(true);
            });

        });

        describe('checkPassword()', function() {

            it('returns a promise', function() {
                expect(typeof encrypt.checkPassword(1)).to.be.equal('object');
                expect(typeof encrypt.checkPassword(1).promiseDispatch).to.be.equal('function');
            });

            it('returns true if the password is correct', function(done) {
                encrypt.configs.encryptPassword = sjcl.hash.sha256.hash('1');

                encrypt.checkPassword('1')
                .then(function(res) {
                    expect(res).to.be.equal(true);
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('returns false if the password is incorrect', function(done) {
                encrypt.checkPassword('2')
                .then(function(res) {
                    expect(res).to.be.equal(false);
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('saveSecureKey()', function() {

            it('returns a promise', function() {
                expect(typeof encrypt.saveSecureKey(1)).to.be.equal('object');
                expect(typeof encrypt.saveSecureKey(1).promiseDispatch).to.be.equal('function');
            });

            it('caches keys in memory', function(done) {
                encrypt.saveSecureKey('1')
                .then(function() {
                    expect(typeof encrypt.keys).to.be.equal('object');
                    expect(typeof encrypt.keys.key).to.be.equal('object');
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('saves keys in sessionStorage', function(done) {
                if (!window.sessionStorage) {
                    return;
                }

                encrypt.saveSecureKey('1')
                .then(function() {
                    return encrypt._getSession();
                })
                .then(function(keys) {
                    expect(typeof keys).to.be.equal('object');
                    expect(typeof keys.key).to.be.equal('object');
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('saves PBKDF2, not plain text password', function(done) {
                encrypt.saveSecureKey('1')
                .then(function() {
                    expect(encrypt.keys.key).not.to.be.equal('1');
                    expect(encrypt.keys.hexKey).not.to.be.equal('1');
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

        });

        describe('deleteSecureKey()', function() {
            var keys;

            before(function() {
                keys = {key: 'pseudo key'};
                encrypt.keys = keys;
            });

            it('removes locally cached key', function() {
                encrypt.deleteSecureKey();
                expect(_.isEqual(encrypt.keys, {})).to.be.equal(true);
                expect(!_.isEqual(encrypt.keys, keys)).to.be.equal(true);
            });

            it('removes keys from the session storage', function() {
                if (!window.sessionStorage) {
                    return;
                }

                window.sessionStorage.setItem(encrypt._getSessionKey(), keys.key);
                expect(window.sessionStorage.getItem(encrypt._getSessionKey())).to.be.equal(keys.key);

                encrypt.deleteSecureKey();
                expect(window.sessionStorage.getItem(encrypt._getSessionKey())).not.to.be.equal(keys.key);
            });
        });

        describe('encrypt()', function() {

            before(function(done) {
                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
            });

            it('returns a promise', function() {
                expect(typeof encrypt.encrypt(1)).to.be.equal('object');
                expect(typeof encrypt.encrypt(1).promiseDispatch).to.be.equal('function');
            });

            it('resolves with encrypted string', function(done) {
                encrypt.encrypt('String')
                .then(function(res) {
                    expect(typeof res).to.be.equal('string');
                    expect(res).not.to.be.equal('String');
                    expect(res.match(/^\{.*\}$/).length !== 0).to.be.equal(true);
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('encrypted string is a simple JSON', function(done) {
                encrypt.encrypt('Hello world')
                .then(function(res) {
                    res = sjcl.json.decode(res);

                    expect(typeof res).to.be.equal('object');
                    expect(_.keys(res).length >= 9).to.be.equal(true);

                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('generates random IV every time', function(done) {
                var promises    = [],
                    previousIvs = [];

                function testIv(res) {
                    res = sjcl.json.decode(res);

                    expect(_.indexOf(previousIvs, res.iv) === -1).to.be.equal(true);
                    previousIvs.push(res.iv);
                    expect(_.indexOf(previousIvs, res.iv) !== -1).to.be.equal(true);
                }

                for (var i = 0; i < 100; i++) {
                    promises.push(
                        encrypt.encrypt('Hello world ' + i)
                        .then(testIv)
                    );
                }

                Q.all(promises)
                .then(function() {
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('JSON data contains everything', function(done) {
                encrypt.encrypt('Hello world.')
                .then(function(res) {
                    res = sjcl.json.decode(res);
                    res = _.pick(res, 'cipher', 'ct', 'iter', 'iv', 'ks', 'mode', 'salt', 'ts', 'v');

                    expect(_.keys(res).length >= 9).to.be.equal(true);

                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('decrypt()', function() {

            before(function(done) {
                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
            });

            it('returns a promise', function() {
                expect(typeof encrypt.decrypt('string')).to.be.equal('object');
                expect(typeof encrypt.decrypt('string').promiseDispatch).to.be.equal('function');
            });

            it('resolves with a decrypted string', function(done) {
                var str = 'Encrypted string ' + sjcl.random.randomWords(10, 0),
                    encrypted;

                encrypt.encrypt(str)
                .then(function(res) {
                    encrypted = res;
                    return encrypt.decrypt(str);
                })
                .then(function(decrypted) {
                    expect(typeof decrypted).to.be.equal('string');
                    expect(decrypted).not.to.be.equal(encrypted);
                    expect(decrypted).to.be.equal(str);

                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('encryptModel()', function() {

            before(function(done) {
                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
            });

            it('returns a promise', function() {
                var model = require('models/note');
                model     = new model({id: 'random', title: 'Title'}); // jshint ignore:line

                expect(typeof encrypt.encryptModel(model)).to.be.equal('object');
                expect(typeof encrypt.encryptModel(model).promiseDispatch).to.be.equal('function');
            });

            it('creates "encryptedData" attribute', function(done) {
                var model = require('models/note');
                model     = new model({id: 'random', title: 'Title'}); // jshint ignore:line

                encrypt.encryptModel(model)
                .then(function() {
                    var res = sjcl.json.decode(model.get('encryptedData'));

                    expect(typeof res).to.be.equal('object');
                    expect(typeof model.get('encryptedData')).to.be.equal('string');
                    expect(_.isEqual(
                        model.get('encryptedData'),
                        _.pick(model.attributes, model.encryptKeys)
                    )).to.be.equal(false);

                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('resolves with the model', function() {
                var model = require('models/note');
                model     = new model({id: 'random', title: 'Title'}); // jshint ignore:line

                encrypt.encryptModel(model)
                .then(function(m) {
                    expect(typeof m).to.be.equal('object');
                    expect(typeof m.get('encryptedData')).to.be.equal('string');
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });

            it('can encrypt all models', function(done) {
                var promises = [];

                function testModel(m) {
                    var defer = Q.defer();

                    requirejs(['models/' + m], function(m) {
                        m = new m({id: 'random', title: 'Random', name: 'Random'}); // jshint ignore:line

                        encrypt.encryptModel(m)
                        .then(function(model) {
                            var res = sjcl.json.decode(model.get('encryptedData'));

                            expect(typeof res).to.be.equal('object');
                            expect(typeof model.get('encryptedData')).to.be.equal('string');

                            defer.resolve();
                        });
                    });

                    return defer.promise;
                }

                _.each(['note', 'notebook', 'tag'], function(m) {
                    promises.push(testModel(m));
                });

                Q.all(promises)
                .then(function() {
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('decryptModel()', function() {
            var Model;

            before(function(done) {
                Model = require('models/note');
                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
            });

            it('returns a promise', function() {
                var model = new Model({id: 'random', title: 'Title'});

                expect(typeof encrypt.decryptModel(model)).to.be.equal('object');
                expect(typeof encrypt.decryptModel(model).promiseDispatch).to.be.equal('function');
            });

            it('calls _decryptModel if a model has "encryptedData" attribute', function(done) {
                var fun   = encrypt._decryptModel,
                    model = new Model({id: 'random', title: 'Title', encryptedData: 'data'});

                encrypt._decryptModel = function() {
                    encrypt._decryptModel = fun;
                    done();
                };

                encrypt.decryptModel(model);
            });

            it('calls _decryptModelKeys if a model does not have "encryptedData" attribute', function(done) {
                var fun   = encrypt._decryptModelKeys,
                    model = new Model({id: 'random', title: 'Title'});

                encrypt._decryptModelKeys = function() {
                    encrypt._decryptModelKeys = fun;
                    done();
                };

                encrypt.decryptModel(model);
            });

            it('decrypts a model\'s data', function(done) {
                var promises = [];

                _.each(['note', 'notebook', 'tag'], function(model) {
                    promises.push(
                        encryptModel(model)
                        .then(decryptModel)
                    );
                });

                Q.all(promises)
                .then(function() {
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('decryptModel() decrypts a model from 0.6.x', function() {

            before(function(done) {

                // We used to save salt as a string
                configs.encryptSalt = configs.encryptSalt.toString();
                encrypt.configs.encryptSalt = configs.encryptSalt;

                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
            });

            it('can decrypt models', function(done) {
                var promises = [];

                function encrypt06(Model) {
                    var model = new Model({id: 'random'});

                    _.each(model.encryptKeys, function(key) {
                        var data = helpers.encrypt062(
                            'random ' + key,
                            encrypt.keys.key,
                            configs
                        );
                        model.set(key, data);
                    });

                    return model;
                }

                _.each(['note', 'notebook', 'tag'], function(model) {
                    promises.push(
                        requirePromise('models/' + model)
                        .then(encrypt06)
                        .then(decryptModel)
                    );
                });

                Q.all(promises)
                .then(function() { done(); })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('decryptModel() decrypts a model from 0.7.0', function() {
            var salt;

            before(function(done) {

                // We used to save encryption salt in HEX format in 0.7.0
                salt = sjcl.codec.hex.fromBits(sjcl.random.randomWords(4, 0));
                salt = encrypt.sjcl.toUpperCase(salt);
                encrypt.configs.encryptSalt = salt;

                // Generate new PBKDF2
                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
                encrypt.configs.encryptSalt = salt;
            });

            it('can decrypt a model', function(done) {
                var promises = [];

                function encrypt07(Model) {
                    var model = new Model({id: 'random'});

                    _.each(model.encryptKeys, function(key) {
                        var data = helpers.encrypt070(
                            'random ' + key,
                            encrypt.configs.encryptSalt,
                            encrypt.sjcl.toUpperCase(encrypt.keys.hexKey),
                            configs
                        );
                        model.set(key, data);
                    });

                    return model;
                }

                _.each(['note', 'notebook', 'tag'], function(model) {
                    promises.push(
                        requirePromise('models/' + model)
                        .then(encrypt07)
                        .then(decryptModel)
                    );
                });

                Q.all(promises)
                .then(function() { done(); })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('encryptModels()', function() {
            var Notes,
                notes;

            before(function(done) {
                Notes = require('collections/notes');
                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
                notes        = new Notes();
                notes.add({id: Math.random()});
            });

            it('returns a promise', function() {
                expect(typeof encrypt.encryptModels(notes)).to.be.equal('object');
                expect(typeof encrypt.encryptModels(notes).promiseDispatch).to.be.equal('function');
            });

            it('resolves a promise if a collection is empty', function(done) {
                notes.reset([]);
                expect(notes.length).to.be.equal(0);

                encrypt.encryptModels(notes)
                .then(function() {
                    done();
                });
            });

            it('resolves a promise if encryption is disabled', function(done) {
                encrypt.configs.encrypt = 0;
                expect(notes.length).not.to.be.equal(0);

                encrypt.encryptModels(notes)
                .then(function() {
                    done();
                });
            });

            it('resolves a promise if there are not any keys', function(done) {
                encrypt.keys = {};
                expect(notes.length).not.to.be.equal(0);
                expect(Number(encrypt.configs.encrypt)).not.to.be.equal(0);

                encrypt.encryptModels(notes)
                .then(function() {
                    done();
                });
            });

            it('encrypts every model in a collection', function(done) {
                var promises = [];

                _.each(['notes', 'notebooks', 'tags'], function(name) {
                    promises.push(
                        encryptModels(name)
                    );
                });

                Q.all(promises)
                .then(function() {
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

        describe('decryptModels()', function() {
            var Notes,
                notes;

            before(function(done) {
                Notes = require('collections/notes');
                setKey(done);
            });

            beforeEach(function() {
                encrypt.keys = keys;
                notes        = new Notes();
                notes.add({id: Math.random()});
            });

            it('returns a promise', function() {
                expect(typeof encrypt.decryptModels(notes)).to.be.equal('object');
                expect(typeof encrypt.decryptModels(notes).promiseDispatch).to.be.equal('function');
            });

            it('resolves a promise if a collection is empty', function(done) {
                notes.reset([]);
                expect(notes.length).to.be.equal(0);

                encrypt.decryptModels(notes)
                .then(function() {
                    done();
                });
            });

            it('resolves a promise if encryption is disabled', function(done) {
                encrypt.configs.encrypt = 0;
                expect(notes.length).not.to.be.equal(0);

                encrypt.decryptModels(notes)
                .then(function() {
                    encrypt.configs.encrypt = 1;
                    done();
                });
            });

            it('resolves a promise if PBKDF2 is empty', function(done) {
                encrypt.keys = {};
                encrypt.decryptModels(notes)
                .then(function() {
                    done();
                });
            });

            it('decrypts models in a collection', function(done) {
                var promises = [];

                _.each(['notes', 'notebooks', 'tags'], function(name) {
                    promises.push(
                        encryptModels(name)
                        .then(decryptModels)
                    );
                });

                Q.all(promises)
                .then(function() {
                    done();
                })
                .fail(function(e) {
                    console.error('Error:', e);
                });
            });
        });

    });
});
