/* global define, chai, describe, it, before, after, afterEach, beforeEach */
define(function(require) {
    'use strict';

    var Encrypt = require('classes/sjcl'),
        sjcl    = require('sjcl'),
        _       = require('underscore'),
        expect  = chai.expect,
        helpers = require('spec/classes/helpers'),
        configs;

    configs = {
        'encrypt'           : '1',
        'encryptPass'       : sjcl.hash.sha256.hash('1'),
        'encryptIter'       : '1000',
        'encryptTag'        : '64',
        'encryptKeySize'    : '128',
    };

    describe('classes/sjcl', function() {
        var encrypt;

        beforeEach(function() {
            var salt = sjcl.random.randomWords(4, 0);
            configs.encryptSalt = sjcl.codec.hex.fromBits(salt);

            expect(typeof configs.encryptSalt).to.be.equal('string');
        });

        before(function() {
            encrypt = new Encrypt();
        });

        after(function() {
        });

        it('hex() can convert string to HEX format', function() {
            var rand = sjcl.random.randomWords(4, 0),
                hex  = encrypt.hex(rand);

            expect(typeof rand).to.be.equal('object');
            expect(typeof hex).to.be.equal('string');
            expect(rand).not.to.be.equal(hex);
        });

        it('toUpperCase() can convert string to uppercase', function() {
            var rand  = encrypt.hex(sjcl.random.randomWords(4, 0)),
                upper = encrypt.toUpperCase(rand);

            expect(/^[A-F0-9 ]*$/.test(upper)).to.be.equal(true);
            expect(/^[A-F0-9 ]*$/.test(rand)).to.be.equal(false);
        });

        it('sha256() can convert a string to SHA256 hash', function(done) {
            encrypt.sha256('hello')
            .then(function(hash) {
                expect(hash).to.be.not.equal('hello');
                expect(typeof hash).to.be.equal('object');
                expect(hash.length).to.be.equal(8);
                done();
            });
        });

        it('getConfigs() returns encryption configs', function() {
            var c = encrypt.getConfigs(configs);

            expect(typeof c).to.be.equal('object');

            expect(c.mode).to.be.equal('ccm');
            expect(c.iter).to.be.equal(Number(configs.encryptIter));
            expect(c.ts).to.be.equal(Number(configs.encryptTag));
            expect(c.ks).to.be.equal(Number(configs.encryptKeySize));
            expect(c.salt).to.be.equal(configs.encryptSalt);
            expect(c.v).to.be.equal(1);
            expect(c.adata).to.be.equal('');
            expect(c.cipher).to.be.equal('aes');
        });

        it('deriveKey() generates PBKDF2', function() {
            var p  = encrypt.deriveKey({
                password: 'my secret key #1',
                configs : configs
            });

            expect(typeof p).to.be.equal('object');

            expect(typeof p.key).to.be.equal('object');
            expect(p.key.length).to.be.equal(configs.encryptKeySize / 32);
            expect(typeof p.hexKey).to.be.equal('string');
        });

        it('deriveKey() generated key is equal to the result returned by sjcl.misc.pbkdf2()', function() {
            var p  = encrypt.deriveKey({password:'my secret key #1', configs: configs}),
                p2 = sjcl.misc.pbkdf2('my secret key #1', configs.encryptSalt, Number(configs.encryptIter), Number(configs.encryptKeySize));

            expect(_.isEqual(p.key, p2)).to.be.equal(true);
            expect(p.hexKey).to.be.equal(sjcl.codec.hex.fromBits(p2));
        });

        describe('Can decrypt data from the previous versions', function() {
            var str,
                encrypted,
                decrypted;

            beforeEach(function() {
                str = 'My secret note ' + encrypt.hex(sjcl.random.randomWords(4, 0));
                for (var i = 0; i < 20; i++) {
                    str += '\r\n ' + encrypt.hex(sjcl.random.randomWords(4, 0));
                }
            });

            afterEach(function() {
                expect(encrypted).to.be.not.equal(str);
                expect(encrypted).to.be.not.equal(decrypted);

                expect(typeof JSON.parse(encrypted)).to.be.equal('object');

                expect(str).to.be.equal(decrypted);
                expect(str.length).to.be.equal(decrypted.length);
            });

            it('can decrypt string from v0.6.2', function() {
                var p = encrypt.deriveKey({password:'my secret key #1', configs: configs});
                encrypt.options = p;

                encrypted = helpers.encrypt062(str, p.key, configs);
                decrypted = encrypt.decryptLegacy({string: encrypted, configs: configs});

                expect(_.size(JSON.parse(encrypted))).to.be.equal(10);
            });

            it('can decrypt string from v0.7.0', function() {
                var salt = encrypt.toUpperCase(encrypt.hex(sjcl.random.randomWords(4, 0))),
                    p;

                configs.encryptSalt = salt;
                p = encrypt.deriveKey({password: 'my secret key #1', configs: configs});
                encrypt.keys = p;

                encrypted = helpers.encrypt070(str, salt, encrypt.toUpperCase(p.hexKey), configs);
                decrypted = encrypt.decryptLegacy({string: encrypted, configs: configs});

                expect(_.size(JSON.parse(encrypted))).to.be.equal(2);
            });
        });

        describe('Encryption', function() {
            var str,
                encrypted;

            before(function() {
                var p = encrypt.deriveKey({password: 'my secret key #1', configs: configs});
                encrypt.keys = p;

                str = 'My string';
            });

            it('can encrypt', function() {
                encrypted = encrypt.encrypt({
                    string  : str,
                    configs : configs,
                    iv      : sjcl.random.randomWords(4, 0)
                });

                expect(encrypted).not.to.be.equal(str);
                expect(typeof encrypted).to.be.equal('string');
                expect(_.size(JSON.parse(encrypted))).to.be.equal(10);
            });

            it('can decrypt', function() {
                var decrypted = encrypt.decrypt({string: encrypted, configs: configs});

                expect(decrypted).not.to.be.equal(encrypted);
                expect(typeof decrypted).to.be.equal('string');
                expect(decrypted.length).to.be.equal(str.length);
                expect(decrypted).to.be.equal(str);
            });

            it('returns an original string if it was not encrypted', function() {
                var decrypted = encrypt.decrypt({string: 'Hello', configs: configs});
                expect(decrypted).to.be.equal('Hello');
            });
        });

    });
});
