/**
 * @module components/settings/show/encryption/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import * as openpgp from 'openpgp';

import Behavior from '../Behavior';
import Key from './Key';
import Passphrase from './Passphrase';

/**
 * Encryption settings view.
 *
 * @todo implement encryption settings
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    /**
     * Behaviors.
     *
     * @see module:components/settings/show/Behavior
     * @returns {Array}
     */
    get behaviors() {
        return [Behavior];
    }

    ui() {
        return {
            useEncrypt: '#useEncryption',
        };
    }

    events() {
        return {
            'click #btn--privateKey' : 'showPrivateKey',
            'click #btn--passphrase' : 'showPasswordView',
            'change @ui.useEncrypt'  : 'useEncryption',
        };
    }

    collectionEvents() {
        return {
            change: 'render',
        };
    }

    initialize() {
        this.user = Radio.request('collections/Profiles', 'getUser');
    }

    /**
     * Show a user's personal key information.
     */
    showPrivateKey() {
        this.showKey(this.privateKey, true);
    }

    /**
     * Show a key information.
     *
     * @param {Object} key
     * @param {Boolean} isPrivate - true if it's a user's personal key
     */
    showKey(key, isPrivate) {
        const view = new Key({key, isPrivate});
        Radio.request('Layout', 'show', {view, region: 'modal'});
    }

    /**
     * Show the password view where one can change their passphrase.
     */
    showPasswordView() {
        const view = new Passphrase({model: this.user});
        Radio.request('Layout', 'show', {view, region: 'modal'});
    }

    /**
     * Ask a user if they are sure they want to disable encryption.
     */
    async useEncryption() {
        // Don't show the confirmation dialog if a user is enabling encryption
        if (this.ui.useEncrypt.is(':checked')) {
            return true;
        }

        const answer = await Radio.request('components/confirm', 'show', {
            content: _.i18n('Are you sure you want to disable encryption?'),
        });

        if (answer === 'reject') {
            this.ui.useEncrypt.prop('checked', true);
        }
    }

    /**
     * serializeData.
     *
     * @returns {Object}
     */
    serializeData() {
        const models = this.collection.getConfigs();

        // Read the private key
        this.privateKey = openpgp.key.readArmored(this.user.get('privateKey')).keys[0];
        return {models, privateKey: this.privateKey};
    }

}
