/**
 * @module components/settings/show/sync/Users
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import Mn from 'backbone.marionette';

/**
 * Show a list of users whom you trust or invited.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Users extends Mn.View {

    get template() {
        const tmpl = require('./users.html');
        return _.template(tmpl);
    }

    collectionEvents() {
        return {
            'add change update': 'render',
        };
    }

    events() {
        return {
            'click .sync--invite--reject': 'rejectInvite',
            'click .sync--invite--accept': 'acceptInvite',
            'click .sync--trust--remove' : 'removeFromTrust',
        };
    }

    /**
     * Show a confirmation dialog before accepting/rejecting an invite.
     *
     * @param {Object} e
     * @param {String} content
     * @returns {Promise}
     */
    showConfirm(e, content) {
        const username = this.$(e.currentTarget).attr('data-user');
        const model    = this.collection.get(username);

        return Radio.request('components/confirm', 'show', {
            content: _.i18n(content, model.getData()),
        })
        .then(res => [res, model]);
    }

    /**
     * Reject an invite.
     *
     * @param {Object} e
     * @returns {Promise}
     */
    rejectInvite(e) {
        return this.showConfirm(e, 'Confirm you want to reject the invite')
        .then(([res, model]) => {
            if (res === 'confirm') {
                return model.channel.request('rejectInvite', {model});
            }
        });
    }

    /**
     * Accept an invite.
     *
     * @param {Object} e
     * @returns {Promise}
     */
    acceptInvite(e) {
        return this.showConfirm(e, 'Confirm you want to add the user to trust')
        .then(([res, model]) => {
            if (res === 'confirm') {
                return model.channel.request('acceptInvite', {model});
            }
        });
    }

    /**
     * Remove a user from trust.
     *
     * @param {Object} e
     * @returns {Promise}
     */
    removeFromTrust(e) {
        e.preventDefault();

        return this.showConfirm(e, 'Confirm you want to remove the user from trust')
        .then(([res, model]) => {
            if (res === 'confirm') {
                return model.channel.request('remove', {model});
            }
        });
    }

    serializeData() {
        return {
            pendingUsers : this.collection.getPending(),
            trustedUsers : this.collection.getTrusted(),
        };
    }

}
