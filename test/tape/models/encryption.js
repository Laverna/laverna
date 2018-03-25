/**
 * Test utils/Encryption
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import * as openpgp from 'openpgp';
import sjcl from 'sjcl';
import Radio from 'backbone.radio';

import Encryption from '../../../app/scripts/models/Encryption';
import Users from '../../../app/scripts/collections/Users';
import User  from '../../../app/scripts/models/User';
import Profile  from '../../../app/scripts/models/Profile';
import Notes from '../../../app/scripts/collections/Notes';

let sand;
const user = new Profile({username: 'bob', privateKey: 'private', publicKey: 'public'});
test('models/Encryption: before()', t => {
    sand = sinon.sandbox.create();
    Radio.reply('collections/Profiles', 'getUser', user);
    localStorage.clear();
    t.end();
});

test('models/Encryption: channel', t => {
    t.equal(Encryption.prototype.channel.channelName, 'models/Encryption');
    t.end();
});

test('models/Encryption: configs', t => {
    Radio.replyOnce('collections/Configs', 'findConfigs', {});
    t.equal(typeof Encryption.prototype.configs, 'object');
    t.end();
});

test('models/Encryption: user', t => {
    t.equal(Encryption.prototype.user, user.attributes);
    t.end();
});

test('models/Encryption: constructor()', t => {
    const reply      = sand.stub(Encryption.prototype.channel, 'reply');
    const enc        = new Encryption({privateKey: 'key'});

    t.equal(enc.openpgp, openpgp, 'creates "openpgp" property');
    t.equal(enc.openpgp.config.compression, 0, 'disables compression in OpenPGP');
    t.equal(enc.openpgp.config.use_native, false, 'disables native crypto');
    t.deepEqual(enc.options, {privateKey: 'key'}, 'creates "options" property');

    t.equal(reply.calledWith({
        // Core methods
        sha256            : enc.sha256,
        random            : enc.random,
        readKeys          : enc.readKeys,
        readUserKey       : enc.readUserKey,
        generateKeys      : enc.generateKeys,
        changePassphrase  : enc.changePassphrase,
        sign              : enc.sign,
        verify            : enc.verify,
        encrypt           : enc.encrypt,
        decrypt           : enc.decrypt,
        // Backbone related methods
        encryptModel      : enc.encryptModel,
        decryptModel      : enc.decryptModel,
        encryptCollection : enc.encryptCollection,
        decryptCollection : enc.decryptCollection,
    }, enc), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('models/Encryption: sha256()', t => {
    const enc = new Encryption();
    const spy = sand.spy(sjcl.hash.sha256, 'hash');

    enc.sha256({text: 'test'})
    .then(res => {
        t.equal(Array.isArray(res), true, 'resolves with an array');
        t.equal(spy.calledWith('test'), true, 'calls hash method');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: random()', t => {
    const enc = new Encryption();

    enc.random()
    .then(str => {
        t.equal(typeof str, 'string', 'returns "string"');
        t.equal(str.length, 32, 'returns 4 random "words" for default');
        t.notEqual(str.search(/^(?=.*[a-zA-Z])(?=.*[0-9])/), -1,
            'contains both numbers and letters');
        return enc.random({number: 8});
    })
    .then(str => {
        t.equal(str.length, 64, 'returns 8 random "words"');
        t.end();
    });
});

test('models/Encryption: readKeys() - reject', t => {
    const enc  = new Encryption({privateKey: 'key'});
    const read = sand.stub(openpgp.key, 'readArmored');
    read.returns({keys: [{decrypt: () => false}]});

    enc.readKeys()
    .catch(err => {
        t.equal(err, 'Cannot decrypt the private key',
            'rejects the promise if it failed to decrypt the private key');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: readKeys() - resolve', t => {
    const enc        = new Encryption();
    const read       = sand.stub(openpgp.key, 'readArmored');
    const privateKey = {decrypt: () => true, toPublic: () => 'pub'};
    read.returns({keys: [privateKey]});
    sand.stub(enc, 'readPublicKeys').returns(Promise.resolve(['pub']));

    enc.readKeys({privateKey: 'priv', publicKey: 'pub'})
    .then(res => {
        const keys = {
            privateKey,
            privateKeys: [privateKey],
            publicKeys : {bob: 'pub'},
        };
        t.deepEqual(res, keys, 'resolves with private and public keys');
        t.deepEqual(enc.keys, keys, 'creates "keys" property');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: readPublicKeys()', t => {
    const enc   = new Encryption();
    const users = new Users([{pendingAccept: true}, {pendingAccept: false}]);
    const req   = sand.stub(Radio, 'request').returns(Promise.resolve(users));
    sand.stub(enc, 'readUserKey');

    enc.readPublicKeys()
    .then(() => {
        t.equal(req.calledWith('collections/Users', 'find'), true,
            'requests users');
        t.equal(enc.readUserKey.callCount, 1, 'reads users public keys');
        t.equal(enc.readUserKey.calledWith({model: users.at(1)}), true,
            'reads the keys of users who are trusted');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: readUserKey()', t => {
    const enc   = new Encryption();
    const read  = sand.stub(openpgp.key, 'readArmored');
    const model = new User({username: 'alice', publicKey: 'armored'});
    read.returns({keys: ['pubKey']});

    enc.keys  = {publicKeys: {}};
    const res = enc.readUserKey({model});

    t.deepEqual(res, 'pubKey', 'returns the key');
    t.equal(enc.keys.publicKeys.alice, 'pubKey',
        'saves the key in this.keys.publicKeys');

    sand.restore();
    t.end();
});

test('models/Encryption: generateKeys()', t => {
    const enc   = new Encryption({privateKey: 'key'});
    const key   = {privateKeyArmored: 'priv', publicKeyArmored: 'pub'};
    enc.openpgp = {generateKey: sand.stub().returns(Promise.resolve(key))};

    enc.generateKeys({userIds: [{name: 'me'}], passphrase: 'test'})
    .then(res => {
        t.equal(enc.openpgp.generateKey.calledWith({
            numBits    : 2048,
            userIds    : [{name: 'me'}],
            passphrase : 'test',
        }), true, 'generates the keys');

        t.deepEqual(res, {
            privateKey: 'priv',
            publicKey : 'pub',
        }, 'resolves with the key');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: changePassphrase()', t => {
    const enc     = new Encryption();
    const encrypt = sand.stub();
    const key     = {
        decrypt : sand.stub().returns(true),
        armor   : sand.stub().returns('newPrivateKey'),
        getAllKeyPackets: sand.stub().returns([{encrypt}, {encrypt}]),
    };
    sand.stub(openpgp.key, 'readArmored').returns({keys: [key]});
    enc.options.privateKey = 'privateKey';

    enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'})
    .then(res => {
        t.equal(encrypt.callCount, 2, 'encrypts all key packets');
        t.equal(res, 'newPrivateKey', 'resolves with the new armored key');

        key.armor.throws();
        return enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'});
    })
    .catch(err => {
        t.equal(err, 'Setting new passphrase failed');

        key.decrypt.returns(false);
        return enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'});
    })
    .catch(err => {
        t.equal(err, 'Wrong old passphrase');
        sand.restore();
        t.end();
    });
});

test('models/Encryption: sign()', t => {
    const enc   = new Encryption();
    enc.keys    = {privateKey: 'privateKey'};
    enc.openpgp = {sign: sand.stub()};
    enc.openpgp.sign.returns(Promise.resolve({data: 'signature'}));

    enc.sign({data: 'text'})
    .then(signature => {
        t.equal(signature, 'signature', 'returns the signature');
        t.equal(enc.openpgp.sign.calledWith({
            data        : 'text',
            privateKeys : enc.keys.privateKey,
        }), true, 'calls "openpgp.sign" method');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: verify()', t => {
    const enc   = new Encryption();
    enc.openpgp = {verify: sand.stub()};
    enc.openpgp.verify.returns(Promise.resolve(true));

    enc.openpgp.cleartext = {readArmored: sand.stub().returns('message')};
    sand.stub(enc, 'getUserKeys').returns({publicKeys: ['pubKey']});

    enc.verify({message: 'armored', publicKeys: ['pubKey']})
    .then(() => {
        t.equal(enc.getUserKeys.notCalled, true, 'use "publicKeys" parameter');
        return enc.verify({message: 'armored'});
    })
    .then(res => {
        t.equal(enc.getUserKeys.called, true, 'calls getUserKeys() method');
        t.equal(res, true, 'returns the result');
        t.equal(enc.openpgp.verify.calledWith({
            message    : 'message',
            publicKeys : ['pubKey'],
        }), true, 'calls "openpgp.verify" method');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: getUserKeys()', t => {
    const enc = new Encryption();
    enc.keys  = {
        privateKey  : 'privateKey',
        privateKeys : ['privateKey'],
        publicKeys  : {bob: 'pubKey', alice: 'pubKey', peer: 'pubKey'},
    };

    t.deepEqual(enc.getUserKeys('bob'), {
        publicKeys  : [enc.keys.publicKeys.bob],
        privateKey  : enc.keys.privateKey,
        privateKeys : enc.keys.privateKeys,
    }, 'returns the users keys');

    t.deepEqual(enc.getUserKeys('alice'), {
        publicKeys  : [enc.keys.publicKeys.bob, enc.keys.publicKeys.alice],
        privateKey  : enc.keys.privateKey,
        privateKeys : enc.keys.privateKeys,
    }, 'contains another users public key');

    t.end();
});

test('models/Encryption: encrypt()', t => {
    const enc     = new Encryption();
    const encrypt = sand.stub().returns(Promise.resolve({data: 'encrypted'}));
    enc.openpgp   = {encrypt};
    sand.stub(enc, 'getUserKeys').returns({privateKey: 'priv', publicKeys: ['pub']});

    enc.encrypt({data: 'clear text', username: 'bob'})
    .then(res => {
        t.equal(enc.getUserKeys.calledWith('bob'), true, 'gets bobs public keys');
        t.equal(encrypt.calledWithMatch({
            privateKey : 'priv',
            publicKeys : ['pub'],
            data       : 'clear text',
        }), true, 'encrypts data');

        t.equal(res, 'encrypted', 'resolves with encrypted string');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: decrypt()', t => {
    const enc   = new Encryption();
    enc.openpgp = {
        decrypt: sand.stub().returns(Promise.resolve({data: 'decrypted'})),
        message: {readArmored: () => 'unarmed'},
    };
    sand.stub(enc, 'getUserKeys').returns({privateKey: 'priv', publicKeys: ['pub']});

    enc.decrypt({message: 'encrypted', username: 'bob'})
    .then(res => {
        t.equal(enc.getUserKeys.calledWith('bob'), true, 'gets bobs public keys');
        t.equal(enc.openpgp.decrypt.calledWithMatch({
            privateKey : 'priv',
            publicKeys : ['pub'],
            message    : 'unarmed',
        }), true, 'encrypts data');

        t.equal(res, 'decrypted', 'resolves with decrypted string');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: encryptModel()', t => {
    const enc  = new Encryption();
    const conf = {encrypt: 0};
    Object.defineProperty(enc, 'configs', {get: () => conf});
    sand.stub(enc, 'encrypt').returns(Promise.resolve('encrypted string'));

    const model = {
        attributes  : {id: '1', title: 'Hello', content: 'World'},
        encryptKeys : ['title', 'content'],
        set         : sand.stub(),
    };

    enc.encryptModel({model, username: 'bob'})
    .then(() => {
        t.equal(enc.encrypt.notCalled, true, 'does nothing if encryption is disabled');

        conf.encrypt = 1;
        return enc.encryptModel({model, username: 'bob'});
    })
    .then(res => {
        t.equal(enc.encrypt.calledWithMatch({
            username : 'bob',
            data     : JSON.stringify({title: 'Hello', content: 'World'}),
        }), true, 'encrypts model attributes');

        t.equal(model.set.calledWith({encryptedData: 'encrypted string'}), true,
            'saves the result in a new attribute - "encryptedData"');

        t.equal(res, model, 'returns the model');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: decryptModel()', t => {
    const enc       = new Encryption();
    const decrypted = JSON.stringify({title: 'Test'});
    sand.stub(enc, 'decrypt').returns(Promise.resolve(decrypted));

    const model = {
        attributes  : {encryptedData: ''},
        set         : sand.stub(),
    };

    enc.decryptModel({model})
    .then(res => {
        t.equal(res, model, 'resolves with the model');
        t.equal(enc.decrypt.notCalled, true,
            'does nothing if encryptedData attribute is empty');

        model.attributes.encryptedData = 'encrypted data';
        return enc.decryptModel({model, username: 'bob'});
    })
    .then(res => {
        t.equal(enc.decrypt.calledWith({
            username : 'bob',
            message  : 'encrypted data',
        }), true, 'decrypts "encryptedData" attribute');
        t.equal(model.set.calledWith({title: 'Test'}), true,
            'sets new attributes');
        t.equal(res, model, 'returns the model');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: encryptCollection()', t => {
    const enc  = new Encryption();
    const conf = {encrypt: 0};
    Object.defineProperty(enc, 'configs', {get: () => conf});
    sand.stub(enc, 'encryptModel').returns(Promise.resolve());
    const collection = new Notes();

    enc.encryptCollection({collection})
    .then(() => {
        t.equal(enc.encryptModel.notCalled, true,
            'does nothing if encryption is disabled');

        conf.encrypt = 1;
        return enc.encryptCollection({collection});
    })
    .then(res => {
        t.equal(res, collection, 'returns the collection');
        t.equal(enc.encryptModel.notCalled, true,
            'does nothing if the collection is empty');

        collection.add([{id: '1'}, {id: '2'}]);
        return enc.encryptCollection({collection, username: 'bob'});
    })
    .then(() => {
        t.equal(enc.encryptModel.callCount, 2, 'encrypts every model in a collection');
        t.equal(enc.encryptModel.calledWith({
            username : 'bob',
            model    : collection.at(0),
        }), true, 'encrypts the first model');
        t.equal(enc.encryptModel.calledWith({
            username : 'bob',
            model    : collection.at(1),
        }), true, 'encrypts the second model');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: decryptCollection()', t => {
    const enc = new Encryption();
    sand.stub(enc, 'decryptModel').returns(Promise.resolve());
    const collection = new Notes();

    enc.decryptCollection({collection})
    .then(res => {
        t.equal(res, collection, 'returns the collection');
        t.equal(enc.decryptModel.notCalled, true,
            'does nothing if the collection is empty');

        collection.add([{id: '1'}, {id: '2'}]);
        return enc.decryptCollection({collection, username: 'bob'});
    })
    .then(() => {
        t.equal(enc.decryptModel.callCount, 2, 'decrypts every model in a collection');
        t.equal(enc.decryptModel.calledWith({
            username : 'bob',
            model    : collection.at(0),
        }), true, 'decrypts the first model');
        t.equal(enc.decryptModel.calledWith({
            username : 'bob',
            model    : collection.at(1),
        }), true, 'decrypts the second model');

        sand.restore();
        t.end();
    });
});
