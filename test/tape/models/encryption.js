/**
 * Test utils/Encryption
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import Encryption from '../../../app/scripts/models/Encryption';
import Notes from '../../../app/scripts/collections/Notes';

const openpgp = require('openpgp');

let sand;
test('models/Encryption: before()', t => {
    sand = sinon.sandbox.create();
    localStorage.clear();
    t.end();
});

test('Encryption: channel', t => {
    t.equal(Encryption.prototype.channel.channelName, 'models/Encryption');
    t.end();
});

test('Encryption: constructor()', t => {
    const reply = sand.stub(Encryption.prototype.channel, 'reply');
    const enc   = new Encryption({privateKey: 'key'});

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

test('Encryption: readKeys()', t => {
    const enc  = new Encryption({privateKey: 'key'});
    const read = sand.stub(openpgp.key, 'readArmored');

    const decrypt = sand.stub().returns(true);
    const keys    = {
        privateKey : {key : 'private', decrypt},
        publicKeys : [{key : 'public'}],
    };
    read.withArgs('privateKey').returns({keys: [keys.privateKey]});
    read.withArgs('publicKey').returns({keys: keys.publicKeys});

    const res = enc.readKeys({
        privateKey: 'privateKey',
        publicKeys: ['publicKey'],
    });
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.deepEqual(enc.keys, {
        privateKey  : keys.privateKey,
        privateKeys : [keys.privateKey],
        publicKeys  : keys.publicKeys,
    }, 'creates "keys" property');

    res.then(() => {
        enc.options = {privateKey: 'privateKey', publicKeys: ['publicKey']};
        decrypt.returns(false);
        return enc.readKeys();
    })
    .catch(err => {
        t.equal(err, 'Cannot decrypt the private key',
            'rejects the promise if it failed to decrypt the private key');
        sand.restore();
        t.end();
    });
});

/*
 * @todo
test('Encryption: generateKeys()', t => {
    const enc  = new Encryption({privateKey: 'key'});
    const stub = sand.spy(openpgp, 'generateKey');

    enc.generateKeys({userIds: [{name: 'me'}], passphrase: 'test'})
    .then(() => {
        t.equal(stub.calledWith({
            numBits    : 2048,
            userIds    : [{name: 'me'}],
            passphrase : 'test',
        }), true, 'generates the keys');

        sand.restore();
        t.end();
    });
});
*/

// @todo
test('Encryption: changePassphrase()', t => {
    t.end();
});

test('Encryption: encrypt()', t => {
    t.end();
});

test('Encryption: decrypt()', t => {
    t.end();
});

test('Encryption: encryptModel()', t => {
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

test('Encryption: decryptModel()', t => {
    const enc       = new Encryption();
    const decrypted = JSON.stringify({title: 'Test'});
    sand.stub(enc, 'decrypt').returns(Promise.resolve(decrypted));

    const model = {
        attributes  : {encryptedData: 'encrypted data'},
        set         : sand.stub(),
    };

    enc.decryptModel({model})
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

test('Encryption: encryptCollection()', t => {
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

test('Encryption: decryptCollection', t => {
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

test('Encryption: sha256()', t => {
    t.end();
});
