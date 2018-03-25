/**
 * @module models/User
 */
import Model from './Model';

/**
 * User model.
 * Stores information about users with whom you want to connect.
 *
 * @class
 * @extends module:models/Model
 * @license MPL-2.0
 */
export default class User extends Model {

    get storeName() {
        return 'users';
    }

    /**
     * Use username as ID attribute.
     *
     * @prop {String}
     */
    get idAttribute() {
        return 'username';
    }

    /**
     * Default values.
     *
     * @prop {String} type - equal to users
     * @prop {String} username
     * @prop {String} fingerprint
     * @prop {String} publicKey
     * @prop {Boolean} pendingInvite - true if the user was invited by you
     * and you're waiting for their answer
     * @prop {Boolean} pendingAccept - true if you have been invited by this
     * user and they're waiting for your answer
     * @returns {Object}
     */
    get defaults() {
        return {
            type          : 'users',
            username      : '',
            fingerprint   : '',
            publicKey     : '',
            pendingAccept : false,
            pendingInvite : false,
        };
    }

    get validateAttributes() {
        return ['username', 'publicKey', 'fingerprint'];
    }

    get escapeAttributes() {
        return ['username', 'publicKey', 'fingerprint'];
    }

}
