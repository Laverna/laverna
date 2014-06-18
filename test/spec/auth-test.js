/* global define, describe, before, it */
define([
    'underscore',
    'chai',
    'apps/encryption/auth'
], function (_, chai, getAuth) {
    'use strict';

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
                auth.secureKey = null;
                expect(auth.checkAuth()).to.be.equal(false);
            });

        });

    });

});
