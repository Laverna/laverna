/**
 * @module collections/Users
 */
import User from '../models/User';
import Collection from './Collection';

/**
 * User collection.
 *
 * @class
 * @extends module:collections/Collection
 * @license MPL-2.0
 */
export default class Users extends Collection {

    /**
     * User model.
     *
     * @returns {Object}
     */
    get model() {
        return User;
    }

    /**
     * Return an array of users who are waiting for your approval.
     *
     * @returns {Array}
     */
    getPending() {
        return this.filter(model => model.get('pendingAccept'));
    }

    /**
     * Return an array of users whom you trust.
     *
     * @returns {Array}
     */
    getTrusted() {
        return this.filter(model => !model.get('pendingAccept'));
    }

    /**
     * Return an array of users whom you trust and who accepted your invite.
     * Those are the users with whom it is safe to try to establish connection.
     *
     * @returns {Array}
     */
    getActive() {
        return this.filter(model => {
            return !model.get('pendingAccept') && !model.get('pendingInvite');
        });
    }

}
