/**
 * @module components/importExport/migrate/Encryption
 */
import _ from 'underscore';
import sjcl from 'sjcl';
import Radio from 'backbone.radio';

/**
 * Legacy encryption class (it exists only for migration purpose).
 *
 * @class
 * @license MPL-2.0
 */
export default class Encryption {

    /**
     * @param {Array} {configs} - an array of configs
     */
    constructor({configs}) {
        this.configs = configs;
    }

    /**
     * Check the password and create a PBKDF2 if it's correct.
     *
     * @param {Object} opt
     * @param {String} opt.password
     * @returns {Promise}
     */
    auth(opt) {
        return this.checkPassword(opt)
        .then(res => {
            if (!res) {
                return res;
            }

            return this.deriveKey(opt);
        });
    }

    /**
     * Check if the password is correct.
     *
     * @param {String} {password}
     * @returns {Promise} resolves with boolean
     */
    checkPassword({password}) {
        return Radio.request('models/Encryption', 'sha256', {text: password})
        .then(passHash => {
            return (passHash.toString() === this.configs.encryptPass.toString());
        });
    }

    /**
     * Compute PBKDF2.
     *
     * @param {String} {password}
     * @returns {Object}
     */
    deriveKey({password}) {
        let pbkdf2 = {};

        pbkdf2.iter = Number(this.configs.encryptIter);
        pbkdf2.salt = this.configs.encryptSalt;

        pbkdf2    = sjcl.misc.cachedPbkdf2(password, pbkdf2);
        const key = pbkdf2.key.slice(0, Number(this.configs.encryptKeySize) / 32);

        return (this.keys = {key, hexKey: sjcl.codec.hex.fromBits(key)});
    }

    /**
     * Decrypt some text.
     *
     * @param {String} {text}
     * @returns {String}
     */
    decrypt({text}) {
        if ((!text || !text.length) || !this.configs.encrypt) {
            return text;
        }

        return sjcl.decrypt(this.keys.key, text);
    }

    /**
     * Decrypt a model's attributes
     *
     * @param {Object} {attributes}
     * @returns {Object}
     */
    decryptModel({attributes}) {
        if (!this.configs.encrypt) {
            return attributes;
        }

        const decrypted = JSON.parse(this.decrypt({text: attributes.encryptedData}));
        return _.extend({}, attributes, decrypted);
    }

}
