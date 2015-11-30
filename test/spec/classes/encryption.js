/* global define, chai, describe, it, before */
define([
    'underscore',
    'backbone.radio',
    'sjcl',
    'classes/encryption',
    'models/note',
    'collections/notes',
    'models/tag',
    'collections/tags',
    'models/notebook',
    'collections/notebooks',
], function(_, Radio, sjcl, Encrypt, Note, Notes, Tag, Tags, Notebook, Notebooks) {
    'use strict';

    var expect = chai.expect,
        radio  = Radio.channel('encrypt');

    function createData(Model, i) {
        var mData = {};
        mData.id = i;
        _.each(Model.prototype.encryptKeys, function(key) {
            mData[key] = 'Model #' + i + ' ' + key;
        });
        return mData;
    }

    function checkEncryption(model, data) {
        _.each(model.encryptKeys, function(key) {
            expect(model.get(key)).not.to.be.equal(data[key]);
        });
    }

    function checkDecryption(model, data) {
        _.each(model.encryptKeys, function(key) {
            expect(model.get(key)).to.be.equal(data[key]);
            expect(typeof model.get(key)).to.be.equal('string');
        });
    }

    describe('Encryption', function() {
        var configs,
            encrypt;

        before(function() {
            configs = {
                'encrypt'           : '1',
                'encryptPass'       : sjcl.hash.sha256.hash('1'),
                // 'encryptSalt'       : '1A1BF117 40CAF635 527DD127',
                'encryptSalt'       : '386431754,-431935309',
                'encryptIter'       : '1000',
                'encryptTag'        : '64',
                'encryptKeySize'    : '128',
            };

            Radio.replyOnce('configs', 'get:object', configs);
            encrypt = new Encrypt();
        });

        it('is OK', function() {
            expect(typeof encrypt).to.be.equal('object');
            expect(typeof encrypt.configs).to.be.equal('object');
        });

        describe('Check auth', function() {
            it('checkAuth()', function() {
                radio.request('delete:secureKey');
                expect(encrypt.checkAuth()).to.be.equal(false);
            });

            it('responds to request `check:auth`', function() {
                expect(radio.request('check:auth')).to.be.equal(false);
            });
        });

        describe('Properly checks passwords', function() {
            it('checkPassword()', function() {
                expect(encrypt.checkPassword('1')).to.be.equal(true);
                expect(encrypt.checkPassword('2')).to.be.equal(false);
            });

            it('responds to request `check:password`', function() {
                expect(radio.request('check:password', '1')).to.be.equal(true);
                expect(radio.request('check:password', '2')).to.be.equal(false);
            });
        });

        describe('Secure key', function() {
            it('Saves secure key in memory', function(done) {
                radio.request('save:secureKey', '1')
                .then(function() {
                    expect(encrypt.options.key !== null).to.be.equal(true);
                    expect(typeof encrypt.options.hexKey).to.be.equal('string');
                    done();
                });
            });
        });

        describe('Encrypts and decrypts a string', function() {
            var text = 'Hello World!',
                encrypted;

            before(function() {
                encrypted = radio.request('encrypt', text);
            });

            it('encrypts', function() {
                expect(encrypted !== text).to.be.equal(true);
                expect(typeof encrypted).to.be.equal('string');
            });

            it('decrypts', function() {
                expect(radio.request('decrypt', encrypted)).to.be.equal(text);
            });

            it('is compatible with the previous encryption', function() {
                // var str = '{\"iv\":\"bO7jQow1khvXgMOS9sXLxQ==\",\"v\":1,\"iter\":\"1000\",\"ks\":128,\"ts\":64,\"mode\":\"ccm\",\"adata\":\"\",\"cipher\":\"aes\",\"salt\":\"Npei1Tmze/M=\",\"ct\":\"fzMHGhl3zz8zfvAXdQ==\"}';
                var str = '{"iv":"dQPYvaPcnSefsuLjs4CLWg==","v":1,"iter":"1000","ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"c09m6JEjt5w=","ct":"F+xq5Vz23ri5cH+rQJ70mUo7v2UfaLulWcRXQxHXDYXQXLEX4v3+24NY2w3ZlXcrr90+w+rJmBhraU10V9yXJeExHgCZy4XctpiyH2LBTDx+Q6GZrR/kGtLgEXmP8HGfzQdRhTLbL3db+cWzy/srEasCWKoLSG7ojNa++Ei72gniXXnfC/t/DGFhP0x0iAo9fqzT4+z6B1yPEp/6PoVKEma+oaIpDrsGZ1cou/VwU4pgnfABga6Ere0qkqUmtiSE2yRN0iGhQlVIPbfv28Oi1ZJ7aQZZkXs31RqUAM/zSLkmLyl6j2Ch59Oa61GUZuK/U2MYNGvxB36cfr4KQkUm5iHWfxKBGT+89pflQ1RA2U7Fqo4wX08fnqnw3C1aoCqtNZFSjBsGeMdN+x4lIJvwqSUA6VN1pnwmjszXrWnoLfKS0Sl2zgkgwyUj9gs+bw=="}';

                expect(radio.request('decrypt', str).search('How to use tags') !== -1).to.be.equal(true);
            });
        });

        function testCollection(Model, Collection) {
            describe('Encrypting ' + Model.prototype.storeName, function() {
                var collection,
                    data;

                before(function() {
                    // Initializing a collection
                    data = [];

                    for (var i = 0; i <= 200; i++) {
                        data.push(createData(Model, i));
                    }

                    collection = new Collection();
                    collection.add(data);
                });

                describe('Encrypts and decrypts a model', function() {
                    var model;

                    before(function() {
                        model = new Model(data[0]);
                    });

                    it('encrypts a model', function() {
                        radio.request('encrypt:model', model);
                        checkEncryption(model, data[0]);
                    });

                    it('decrypts a model', function() {
                        radio.request('decrypt:model', model);
                        checkDecryption(model, data[0]);
                    });
                });

                describe('Encrypts and decrypts a collection', function() {
                    it('encrypts a collection', function(done) {
                        radio.request('encrypt:models', collection)
                        .then(function() {
                            collection.each(function(model) {
                                checkEncryption(model, data[model.id]);
                            });
                            done();
                        });
                    });

                    it('decrypts a collection', function(done) {
                        radio.request('decrypt:models', collection)
                        .then(function() {
                            collection.each(function(model) {
                                checkDecryption(model, data[model.id]);
                            });
                            done();
                        });
                    });
                });

                describe('Re encryption', function() {
                    var newConfigs;

                    before(function() {
                        newConfigs = configs;
                        newConfigs.encryptPass = sjcl.hash.sha256.hash('2');
                        newConfigs.encryptSalt = '1A1bF117 42C4F435 527Aa127';
                    });

                    it('can change configs', function() {
                        radio.request('change:configs', newConfigs);
                        var result = radio.request('check:password', '2');
                        expect(result).to.be.equal(true);
                    });

                    it('can decrypt with old configs', function(done) {
                        radio.request('change:configs', configs);

                        radio.request('save:secureKey', '1')
                        .then(function() {
                            return radio.request('decrypt:models', collection);
                        })
                        .then(function() {
                            collection.each(function(model) {
                                checkDecryption(model, data[model.id]);
                            });
                        })
                        .then(done);
                    });

                    it('can encrypt and decrypt with new configs', function(done) {
                        radio.request('change:configs', newConfigs);

                        radio.request('save:secureKey', '2')
                        .then(function() {
                            return radio.request('encrypt:models', collection);
                        })
                        .then(function() {
                            collection.each(function(model) {
                                checkEncryption(model, data[model.id]);

                                radio.request('decrypt:model', model);
                                checkDecryption(model, data[model.id]);
                            });
                        })
                        .then(done);
                    });

                    it('async re-encryption', function(done) {
                        radio.request('change:configs', configs);

                        radio.request('save:secureKey', '1')
                        .then(function() {
                            return radio.request('decrypt:models', collection);
                        })
                        .then(function() {
                            collection.each(function(model) {
                                checkDecryption(model, data[model.id]);
                            });
                        })
                        .then(function() {
                            radio.request('change:configs', newConfigs);
                            return radio.request('save:secureKey', '2');
                        })
                        .then(function() {
                            return radio.request('encrypt:models', collection);
                        })
                        .then(function() {
                            collection.each(function(model) {
                                checkEncryption(model, data[model.id]);

                                radio.request('decrypt:model', model);
                                checkDecryption(model, data[model.id]);
                            });
                        })
                        .then(done);
                    });
                });
            });
        }

        testCollection(Note, Notes);
        testCollection(Tag, Tags);
        testCollection(Notebook, Notebooks);
    });

});
