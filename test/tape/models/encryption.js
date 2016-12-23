/**
 * Test utils/Encryption
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import * as openpgp from 'openpgp';
import sjcl from 'sjcl';

import Encryption from '../../../app/scripts/models/Encryption';
import Notes from '../../../app/scripts/collections/Notes';

let sand;
test('models/Encryption: before()', t => {
    sand = sinon.sandbox.create();
    localStorage.clear();
    t.end();
});

test('models/Encryption: channel', t => {
    t.equal(Encryption.prototype.channel.channelName, 'models/Encryption');
    t.end();
});

test('models/Encryption: constructor()', t => {
    const reply = sand.stub(Encryption.prototype.channel, 'reply');
    const enc   = new Encryption({privateKey: 'key'});

    t.equal(enc.openpgp, openpgp, 'creates "openpgp" property');
    t.deepEqual(enc.options, {privateKey: 'key'}, 'creates "options" property');

    t.equal(reply.calledWith({
        readKeys         : enc.readKeys,
        generateKeys     : enc.generateKeys,
        changePassphrase : enc.changePassphrase,
        encrypt          : enc.encrypt,
        decrypt          : enc.decrypt,
        encryptModel     : enc.encryptModel,
        decryptModel     : enc.decryptModel,
        encryptCollection: enc.encryptCollection,
        decryptCollection: enc.decryptCollection,
        sha256           : enc.sha256,
    }, enc), true, 'starts replying to requests');

    sand.restore();
    t.end();
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
    const privateKey = {decrypt: () => true};
    read.returns({keys: [privateKey]});
    sand.stub(enc, 'readPublicKeys').returns(['pub']);

    enc.readKeys({privateKey: 'priv', publicKey: 'pub'})
    .then(res => {
        const keys = {
            privateKey,
            privateKeys: [privateKey],
            publicKeys : ['pub'],
        };
        t.deepEqual(res, keys, 'resolves with private and public keys');
        t.deepEqual(enc.keys, keys, 'creates "keys" property');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: readPublicKeys()', t => {
    const enc  = new Encryption();
    const read = sand.stub(openpgp.key, 'readArmored');
    read.returns({keys: ['pubKey']});

    const res = enc.readPublicKeys({publicKeys: {test: 'test', test2: 'test2'}});
    t.deepEqual(res, ['pubKey', 'pubKey'], 'returns an array of public keys');
    t.equal(read.callCount, 2, 'reads all keys');

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
    const read = sand.stub(openpgp.key, 'readArmored').returns({keys: [key]});
    enc.options.privateKey = 'privateKey';

    enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'})
    .then(res => {
        t.equal(encrypt.callCount, 2, 'encrypts all key packets');
        t.equal(res, 'newPrivateKey', 'resolves with the new armored key');

        key.armor.throws();
        return enc.changePassphrase({newPassphrase: '1', oldPassphrase: '2'})
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

test('models/Encryption: encrypt()', t => {
    const enc     = new Encryption();
    const encrypt = sand.stub().returns(Promise.resolve({data: 'encrypted'}));
    enc.openpgp   = {encrypt};
    enc.keys      = {privateKey: 'priv', publicKey: 'pub'};

    enc.encrypt({data: 'clear text'})
    .then(res => {
        t.equal(encrypt.calledWithMatch({
            privateKey : 'priv',
            publicKey  : 'pub',
            data       : 'clear text',
        }), true, 'encrypts data');

        t.equal(res, 'encrypted', 'resolves with encrypted string');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: decrypt()', t => {
    const enc   = new Encryption();
    enc.keys    = {privateKey: 'priv', publicKey: 'pub'};
    enc.openpgp = {
        decrypt: sand.stub().returns(Promise.resolve({data: 'decrypted'})),
        message: {readArmored: () => 'unarmed'},
    };

    enc.decrypt({message: 'encrypted'})
    .then(res => {
        t.equal(enc.openpgp.decrypt.calledWithMatch({
            privateKey : 'priv',
            publicKey  : 'pub',
            message    : 'unarmed',
        }), true, 'encrypts data');

        t.equal(res, 'decrypted', 'resolves with decrypted string');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: encryptModel()', t => {
    const enc = new Encryption();
    sand.stub(enc, 'encrypt').returns(Promise.resolve('encrypted string'));

    const model = {
        attributes  : {id: '1', title: 'Hello', content: 'World'},
        encryptKeys : ['title', 'content'],
        set         : sand.stub(),
    };

    enc.encryptModel({model})
    .then(res => {
        t.equal(enc.encrypt.calledWithMatch({
            data: JSON.stringify({title: 'Hello', content: 'World'}),
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
        return enc.decryptModel({model});
    })
    .then(res => {
        t.equal(enc.decrypt.calledWith({message: 'encrypted data'}), true,
            'decrypts "encryptedData" attribute');
        t.equal(model.set.calledWith({title: 'Test'}), true,
            'sets new attributes');
        t.equal(res, model, 'returns the model');

        sand.restore();
        t.end();
    });
});

test('models/Encryption: encryptCollection()', t => {
    const enc = new Encryption();
    sand.stub(enc, 'encryptModel').returns(Promise.resolve());
    const collection = new Notes();

    enc.encryptCollection({collection})
    .then(res => {
        t.equal(res, collection, 'returns the collection');
        t.equal(enc.encryptModel.notCalled, true,
            'does nothing if the collection is empty');

        collection.add([{id: '1'}, {id: '2'}]);
        return enc.encryptCollection({collection});
    })
    .then(() => {
        t.equal(enc.encryptModel.callCount, 2, 'encrypts every model in a collection');
        t.equal(enc.encryptModel.calledWith({model: collection.at(0)}), true,
            'encrypts the first model');
        t.equal(enc.encryptModel.calledWith({model: collection.at(1)}), true,
            'encrypts the second model');

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
        return enc.decryptCollection({collection});
    })
    .then(() => {
        t.equal(enc.decryptModel.callCount, 2, 'decrypts every model in a collection');
        t.equal(enc.decryptModel.calledWith({model: collection.at(0)}), true,
            'decrypts the first model');
        t.equal(enc.decryptModel.calledWith({model: collection.at(1)}), true,
            'decrypts the second model');

        sand.restore();
        t.end();
    });
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
