/**
 * @module collections/modules/Profiles
 */
import Module from './Module';
import Collection from '../Profiles';
import Radio from 'backbone.radio';

/**
 * Profiles collection module
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Profiles extends Module {

    /**
     * Profiles collection.
     *
     * @see module:collections/Profiles
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    get encryptChannel() {
        return Radio.channel('models/Encryption');
    }

    constructor() {
        super();

        this.channel.reply({
            createProfile    : this.createProfile,
            findProfiles     : this.findProfiles,
            setUser          : this.setUser,
            getUser          : this.getUser,
            getProfile       : this.getProfile,
            changePassphrase : this.changePassphrase,
        }, this);
    }

    /**
     * Create a new profile.
     *
     * @public
     * @param {String} username
     * @param {String} privateKey
     * @param {String} publicKey
     * @returns {Promise}
     */
    createProfile({username, privateKey, publicKey}) {
        this.profile = new this.Model({username, privateKey, publicKey});
        return this.saveModel({model: this.profile});
    }

    /**
     * Return profile collection.
     *
     * @public
     * @returns {Object} Backbone collection
     */
    findProfiles() {
        return this.collection;
    }

    /**
     * Set the profile model.
     *
     * @public
     * @param {String} {username}
     */
    setUser({username}) {
        this.profile = this.collection.get({username});
    }

    /**
     * Return the profile model.
     *
     * @public
     * @returns {Object} Backbone model
     */
    getUser() {
        if (!this.profile) {
            return null;
        }

        return this.profile;
    }

    /**
     * Return the user name.
     *
     * @public
     * @returns {String}
     */
    getProfile() {
        return this.getUser().get('username');
    }

    /**
     * Change the private key's passphrase.
     *
     * @public
     * @param {Object} options
     * @param {Object} options.model - "profile" model
     * @param {String} options.oldPassphrase
     * @param {String} options.newPassphrase
     * @returns {Promise}
     */
    async changePassphrase(options) {
        if (options.oldPassphrase === options.newPassphrase) {
            return Promise.reject('New and old passphrase are the same');
        }
        else if (!options.oldPassphrase.length || !options.newPassphrase.length) {
            return Promise.reject('You did not provide old or new passphrase');
        }

        const {model} = options;

        const privateKey = await this.encryptChannel.request('changePassphrase', options);
        return this.saveModel({model, data: {privateKey}});
    }

}
