/**
 * @module models/Encryption
 */
import * as openpgp from 'openpgp';
import sjcl from 'sjcl';
import Radio from 'backbone.radio';
import _ from 'underscore';

import deb from 'debug';

const log = deb('lav:models/Encryption');

/**
 * Encryption class.
 * Almost every method in this class can be requested with Radio requests.
 *
 * @class
 * @extends module:workers/Module
 * @license MPL-2.0
 */
export default class Encryption {

    /**
     * Radio channel (models/Encryption).
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('models/Encryption');
    }

    constructor(options = {}) {
        this.options = options;
        this.openpgp = openpgp;

        // Disable compression for performance
        this.openpgp.config.compression  = 0;

        // Don't use native crypto to use WebWorkers
        this.openpgp.config.use_native = false; // eslint-disable-line
        this.openpgp.initWorker({path: 'scripts/openpgp.worker.js'});

        this.channel.reply({
            readKeys          : this.readKeys,
            generateKeys      : this.generateKeys,
            changePassphrase  : this.changePassphrase,
            encrypt           : this.encrypt,
            decrypt           : this.decrypt,
            encryptModel      : this.encryptModel,
            decryptModel      : this.decryptModel,
            encryptCollection : this.encryptCollection,
            decryptCollection : this.decryptCollection,
            sha256            : this.sha256,
        }, this);
    }

    /**
     * Read key pairs.
     *
     * @param {Object} options=this.options
     * @param {Array} options.publicKeys - an array of public keys
     * @param {String} options.privateKey
     * @param {String} options.passphrase
     * @returns {Object}
     */
    readKeys(options = this.options) {
        this.options     = _.extend(this.options, options);
        const privateKey = this.openpgp.key.readArmored(options.privateKey).keys[0];
        log('readKeys: keys', privateKey, options);

        /**
         * A user's key pairs.
         *
         * @prop {Object}
         * @prop {Array} publicKeys - an array of public keys
         * @prop {Object} privateKey - the private key
         */
        this.keys = {
            privateKey,
            privateKeys : [privateKey],
            publicKeys  : [],
        };

        // Try to decrypt the private key
        if (!this.keys.privateKey.decrypt(options.passphrase)) {
            return Promise.reject('Cannot decrypt the private key');
        }

        // Read public keys
        this.keys.publicKeys = this.readPublicKeys(options);

        log('keys are', this.keys);
        return Promise.resolve(this.keys);
    }

    /**
     * Read all public keys.
     *
     * @param {Object} options
     * @param {Array} options.publicKeys
     * @returns {Array}
     */
    readPublicKeys(options) {
        const keys = [];

        _.each(options.publicKeys, pubKey => {
            const publicKey = this.openpgp.key.readArmored(pubKey).keys[0];
            keys.push(publicKey);
        });

        return keys;
    }

    /**
     * Generate new key pair.
     *
     * @param {Object} options
     * @param {Array} options.userIds
     * @param {String} options.passphrase
     * @returns {Promise} - resolves with an object {privateKey, publicKey}
     */
    generateKeys(options) {
        const opt = _.extend({
            numBits: 2048,
        }, options);

        log('generating new key pair...');
        return this.openpgp.generateKey(opt)
        .then(key => {
            return {
                privateKey : key.privateKeyArmored,
                publicKey  : key.publicKeyArmored,
            };
        });
    }

    /**
     * Change the passphrase of a private key.
     *
     * @param {Object} options
     * @param {String} options.newPassphrase
     * @param {String} options.oldPassphrase
     * @returns {Promise} resolves with the new private key
     */
    changePassphrase(options) {
        const privateKey = this.openpgp.key.readArmored(this.options.privateKey).keys[0];

        // Try to decrypt the private key
        if (!privateKey.decrypt(options.oldPassphrase)) {
            return Promise.reject('Wrong old passphrase');
        }

        // Encrypt the key with the new passphrase
        let newKeyArmored;
        try {
            const packets = privateKey.getAllKeyPackets();
            for (let i = 0; i < packets.length; i++) {
                packets[i].encrypt(options.newPassphrase);
            }

            newKeyArmored = privateKey.armor();
        }
        catch (e) {
            return Promise.reject('Setting new passphrase failed');
        }

        return Promise.resolve(newKeyArmored);
    }

    /**
     * Encrypt string data with PGP keys.
     * If keys aren't provided, it will use the keys from this.configs property.
     *
     * @param {Object} options
     * @param {String} options.data
     * @returns {Promise} - resolves with an encrypted string
     */
    encrypt(options) {
        log('encrypting data', options);
        return this.openpgp.encrypt(_.extend({}, this.keys, options))
        .then(enc => enc.data);
    }

    /**
     * Decrypt armored data with PGP keys.
     * If keys aren't provided, it will use the keys from this.configs property.
     *
     * @param {Object} options
     * @param {String} options.message
     * @returns {Promise}
     */
    decrypt(options) {
        log('decrypting data', options);
        const data = _.extend({}, _.omit(this.keys), options, {
            message : this.openpgp.message.readArmored(options.message),
        });

        return this.openpgp.decrypt(data)
        .then(clearText => clearText.data);
    }

    /**
     * Encrypt a model.
     *
     * @param {Object} options
     * @param {Object} options.model
     * @returns {Promise} resolve with the model
     */
    encryptModel(options) {
        const {model} = options;
        const data    = _.pick(model.attributes, model.encryptKeys);

        return this.encrypt({data: JSON.stringify(data)})
        .then(encryptedData => {
            log('encrypted a model', encryptedData);
            model.set({encryptedData});
            return model;
        });
    }

    /**
     * Decrypt a model.
     *
     * @param {Object} options
     * @param {Object} options.model
     * @returns {Promise} resolves with the model
     */
    decryptModel(options) {
        const {model} = options;
        const message = model.attributes.encryptedData;

        if (!message.length) {
            return Promise.resolve(model);
        }

        return this.decrypt({message})
        .then(decrypted => {
            log('decryptedModel', decrypted);
            const data = JSON.parse(decrypted);
            model.set(data);
            return model;
        });
    }

    /**
     * Encrypt every model in a collection.
     *
     * @param {Object} options
     * @param {Object} options.collection
     * @returns {Promise}
     */
    encryptCollection(options) {
        const {collection} = options;

        if (!collection.length) {
            return Promise.resolve(collection);
        }

        const promises = [];
        collection.each(model => {
            promises.push(this.encryptModel({model}));
        });

        return Promise.all(promises)
        .then(() => collection);
    }

    /**
     * Decrypt every model in a collection.
     *
     * @param {Object} options
     * @param {Object} options.collection
     * @returns {Promise}
     */
    decryptCollection(options) {
        const {collection} = options;

        if (!collection.length) {
            return Promise.resolve(collection);
        }

        const promises = [];
        collection.each(model => {
            promises.push(this.decryptModel({model}));
        });

        return Promise.all(promises)
        .then(() => collection);
    }

    /**
     * Calculate sha256 hash of the string set.
     *
     * @param {Object} options={}
     * @param {String} options.text
     * @returns {Promise}
     */
    sha256(options = {}) {
        return Promise.resolve(sjcl.hash.sha256.hash(options.text));
    }

}
