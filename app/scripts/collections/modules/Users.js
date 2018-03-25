/**
 * @module collections/modules/Users
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import Module from './Module';
import Collection from '../Users';
import * as openpgp from 'openpgp';
import deb from 'debug';

const log = deb('lav:collections/Modules/Users');

/**
 * User collection module
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Users extends Module {

    /**
     * User collection.
     *
     * @see module:collections/Users
     * @prop {Object}
     */
    get Collection() {
        return Collection;
    }

    /**
     * The user's profile data.
     *
     * @prop {Object}
     */
    get user() {
        return Radio.request('collections/Profiles', 'getUser').attributes;
    }

    constructor() {
        super();

        // Add new replies
        this.channel.reply({
            acceptInvite    : this.acceptInvite,
            acceptIfPending : this.acceptIfPending,
            rejectInvite    : this.rejectInvite,
            invite          : this.invite,
            saveInvite      : this.saveInvite,
        }, this);
    }

    async find(...args) {
        if (this.collection) {
            return this.collection;
        }

        await super.find(...args);
        return this.collection;
    }

    async saveModel(options) {
        const privKey = Radio.request('collections/Configs', 'findConfig', {
            name: 'privateKey',
        });

        await super.saveModel(options);

        // Add a users key to the array of public keys if the user's private key exists
        if (privKey && privKey.length) {
            Radio.request('models/Encryption', 'readUserKey', {model: options.model});
        }

        return options.model;
    }

    /**
     * Remove a user from the database.
     *
     * @public
     * @param {Object} options
     * @param {Object} [options.model] - Backbone.model
     * @param {Object} [options.username]
     * @fires channel#destroy:model
     * @returns {Promise}
     */
    async remove(options) {
        const idAttr = this.idAttribute;
        const data   = {[idAttr]: options[idAttr] || options.model.get(idAttr)};
        const model  = new this.Model(data, {profileId: options.profileId});

        await model.destroy();
        return this.collection.remove(model);
    }

    /**
     * Mark an invite as accepted.
     *
     * @public
     * @param {Object} model
     * @returns {Promise}
     */
    async acceptInvite({model}) {
        this.removeServerInvite(model);
        const data = {pendingAccept: false, pendingInvite: false};

        await this.saveModel({model, data});
        Radio.request('models/Peer', 'sendOfferTo', {user: model.attributes});
    }

    /**
     * Mark an invite that you sent as accepted.
     *
     * @param {String} {username}
     */
    async acceptIfPending({username}) {
        const model = await this.findModel({username});
        if (model.get('pendingInvite')) {
            return this.acceptInvite({model});
        }
    }

    /**
     * Reject the invite by removing the model from database.
     *
     * @todo notify the server
     * @public
     * @param {Object} model
     * @returns {Promise}
     */
    rejectInvite({model}) {
        this.removeServerInvite(model);
        return this.remove({model});
    }

    /**
     * Remove a pending invite from the signaling server.
     *
     * @protected
     * @param {Object} model - user model
     */
    removeServerInvite(model) {
        Radio.request('models/Signal', 'removeInvite', {
            username: model.get('username'),
        });
    }

    /**
     * Add a new user to trust.
     *
     * @protected
     * @param {Object} options
     * @param {String} options.profileId
     * @param {Object} options.user
     * @param {String} options.user.username
     * @param {String} options.user.fingerprint
     * @param {String} options.user.publicKey
     * @param {Object} pendingData
     * @returns {Promise}
     */
    addUser(options, pendingData) {
        const {user, profileId} = options;

        // Create a new model
        const model = new this.Model({}, {profileId});
        const data  = _.pick(user, 'username', 'fingerprint', 'publicKey');

        // Save the new model and send an invite
        return this.saveModel({model, data: _.extend(pendingData, data)});
    }

    /**
     * Check if a public key fingerprint is correct.
     *
     * @protected
     * @param {String} publicKey
     * @param {String} fingerprint
     * @returns {Boolean}
     */
    checkKey(publicKey, fingerprint) {
        const {keys, err} = openpgp.key.readArmored(publicKey);
        return (!err && keys[0].primaryKey.fingerprint === fingerprint);
    }

    /**
     * Invite a new user to collaborate:
     * 1. Save the user to pending
     * 2. Send the invite
     *
     * @public
     * @see addUser()
     * @param {Object} options
     * @returns {Promise}
     */
    async invite(options) {
        if (!this.checkKey(options.user.publicKey, options.user.fingerprint)) {
            log('wrong user fingerprint', options.user);
            return false;
        }

        log('saving and sending the invite...');
        await this.addUser(options, {pendingInvite: true});
        await Radio.request('models/Signal', 'sendInvite', options.user);
        return true;
    }

    /**
     * Another user invited to share documents and collaborate:
     * 1. Check the invite signature
     * 2. Save their username, fingerprint, and publicKey if signature is correct
     * 3. Don't accept connections until the offer is accepted
     *
     * @see addUser()
     * @public
     * @param {Object} options
     * @param {String} options.username
     * @param {String} options.fingerprint
     * @param {String} options.publicKey
     * @param {String} options.signature - invite signature
     * @returns {Promise}
     */
    saveInvite(options) {
        const {keys, err} = openpgp.key.readArmored(options.publicKey);

        // Wrong fingerprint
        if (err || keys[0].primaryKey.fingerprint !== options.fingerprint) {
            log('Ignore invite - wrong fingerprint');
            return Promise.resolve(false);
        }

        // If the user exists in the DB, automatically accept the invite
        return this.findModel({username: options.username})
        .then(model => {
            // Remove the invite from the server if the invite was already accepted
            if (!model.get('pendingAccept') && !model.get('pendingInvite')) {
                return this.removeServerInvite(model);
            }

            return this.autoAcceptInvite(options, keys, model);
        })
        .catch(err  => {
            if (err !== 'not found') {
                throw new Error(err);
            }

            // Add a new user
            return this.saveNewInvite(options, keys);
        })
        .then(() => true);
    }

    /**
     * Automatically accept an invite if both users sent invites to each other.
     *
     * @protected
     * @param {Object} options
     * @param {Array}  keys
     * @param {Object} model
     * @returns {Promise}
     */
    async autoAcceptInvite(options, keys, model) {
        const res = await this.checkInviteSignature(options, keys);

        if (res && model.get('fingerprint') === options.fingerprint &&
            model.get('pendingInvite')) {
            return this.acceptInvite({model});
        }
    }

    /**
     * Save an invite from another user.
     *
     * @protected
     * @param {Object} options
     * @param {Array} keys
     * @returns {Promise}
     */
    async saveNewInvite(options, keys) {
        const res = await this.checkInviteSignature(options, keys);
        if (!res) {
            log('Ignore invite - incorrect signature');
            return false;
        }

        await this.addUser({user: options}, {pendingAccept: true});
        return true;
    }

    /**
     * Check if the invite signature is correct.
     *
     * @todo check if the signature contains the correct fingerprint
     * @protected
     * @param {Object} options
     * @param {String} options.username
     * @param {Array} keys - an array which contains the user's public key
     * @returns {Promise} resolves with true if the signature is correct
     */
    async checkInviteSignature(options, keys) {
        const res = await Radio.request('models/Encryption', 'verify', {
            message    : options.signature,
            publicKeys : keys,
        });
        const data = JSON.parse(res.data);

        return (
            res.signatures[0].valid &&
            data.from === options.username &&
            data.to   === this.user.username
        );
    }

}
