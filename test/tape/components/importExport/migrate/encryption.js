/**
 * Test: components/importExport/migrate/Encryption.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import sjcl from 'sjcl';
import _ from '../../../../../app/scripts/utils/underscore';

// eslint-disable-next-line
const Encryption = require('../../../../../app/scripts/components/importExport/migrate/Encryption').default;

const encryptConfigs = {
    encrypt        : 1,
    encryptSalt     : sjcl.random.randomWords(4, 0),
    encryptIter    : 10000,
    encryptTag     : 128,
    encryptKeySize : 256,
};

let sand;
test('importExport/migrate/Encryption: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('importExport/migrate/Encryption: constructor()', t => {
    const configs = {encrypt: 1};
    const encrypt = new Encryption({configs});
    t.equal(encrypt.configs, configs, 'creates "configs" property');

    t.end();
});

test('importExport/migrate/Encryption: auth()', t => {
    const encrypt = new Encryption({configs: {encrypt: 1}});
    const opt     = {password: '1'};
    const check   = sand.stub(encrypt, 'checkPassword').withArgs(opt).resolves(false);
    const derive  = sand.stub(encrypt, 'deriveKey');

    encrypt.auth(opt)
    .then(res => {
        t.equal(res, false, 'returns false');
        t.equal(derive.notCalled, true,
            'does not try to create a PBKDF2 key if the password is incorrect');

        check.resolves(true);
        return encrypt.auth(opt);
    })
    .then(() => {
        t.equal(derive.calledWith(opt), true, 'creates a PBKDF2 key');

        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Encryption: checkPassword()', t => {
    const encryptPass = sjcl.hash.sha256.hash('1');
    const encrypt     = new Encryption({configs: {encryptPass}});

    const req = sand.stub(Radio, 'request')
    .withArgs('models/Encryption', 'sha256', {text: '1'})
    .resolves(sjcl.hash.sha256.hash('2'));

    encrypt.checkPassword({password: '1'})
    .then(res => {
        t.equal(res, false, 'returns false if hashes do not match');

        req.resolves(sjcl.hash.sha256.hash('1'));
        return encrypt.checkPassword({password: '1'});
    })
    .then(res => {
        t.equal(res, true, 'returns true if hashes match');
        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Encryption: deriveKey()', t => {
    const encrypt = new Encryption({configs: encryptConfigs});
    const key     = encrypt.deriveKey({password: '1'});

    t.equal(typeof key, 'object', 'returns an object');
    t.equal(key, encrypt.keys, 'creates "keys" property');

    t.equal(Array.isArray(key.key), true, 'contains the PBKDF2');
    t.equal(typeof key.hexKey, 'string', 'contains the HEX key');

    sand.restore();
    t.end();
});

let encryptedData;
let keys;
test('importExport/migrate/Encryption: before:decrypt()', t => {
    const encrypt = new Encryption({configs: encryptConfigs});
    keys          = encrypt.deriveKey({password: '1'});

    const configs = {
        mode   : 'ccm',
        iter   : Number(encryptConfigs.encryptIter),
        ts     : Number(encryptConfigs.encryptTag),
        ks     : Number(encryptConfigs.encryptKeySize),
        salt   : encryptConfigs.encryptSalt,
        v      : 1,
        adata  : '',
        cipher : 'aes',
        iv     : sjcl.random.randomWords(4, 0),
    };

    const text    = JSON.stringify({title: 'Title', content: 'Content'});
    encryptedData = sjcl.encrypt(keys.key, text, configs);

    t.end();
});

test('importExport/migrate/Encryption: decrypt()', t => {
    const encrypt = new Encryption({configs: encryptConfigs});
    encrypt.keys  = keys;

    const text = encrypt.decrypt({text: encryptedData});
    t.equal(text, JSON.stringify({title: 'Title', content: 'Content'}),
        'can decrypt arbitrary text');

    sand.restore();
    t.end();
});

test('importExport/migrate/Encryption: decryptModel()', t => {
    const encrypt    = new Encryption({configs: encryptConfigs});
    encrypt.keys     = keys;
    const attributes = {id: '1', encryptedData};

    const res = encrypt.decryptModel({attributes});
    t.equal(typeof res, 'object', 'returns an object');
    t.equal(res.id, '1');
    t.equal(res.title, 'Title');
    t.equal(res.content, 'Content');

    sand.restore();
    t.end();
});
