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
import AddPublic from './AddPublic';

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

    events() {
        return {
            'click #btn--privateKey' : 'showPrivateKey',
            'click .btn--publicKey'  : 'showPublicKey',
            'click #btn--passphrase' : 'showPasswordView',
            'click .btn--add--public': 'showAddPublicKey',
        };
    }

    collectionEvents() {
        return {
            change: 'render',
        };
    }

    /**
     * Show a user's personal key information.
     */
    showPrivateKey() {
        this.showKey(this.privateKey, true);
    }

    /**
     * Show a public key information.
     */
    showPublicKey(e) {
        const index = this.$(e.currentTarget).attr('data-index');
        this.showKey(this.keys[index]);
    }

    /**
     * Show a key information.
     *
     * @param {Object} key
     * @param {Boolean} isPrivate - true if it's a user's personal key
     */
    showKey(key, isPrivate) {
        const view = new Key({key, isPrivate, model: this.collection.get('publicKeys')});
        Radio.request('Layout', 'show', {view, region: 'modal'});
    }

    /**
     * Show the password view where one can change their passphrase.
     */
    showPasswordView() {
        const view = new Passphrase({model: this.collection.get('privateKey')});
        Radio.request('Layout', 'show', {view, region: 'modal'});
    }

    /**
     * Show a form where a user can add a public key.
     */
    showAddPublicKey() {
        const view = new AddPublic({model: this.collection.get('publicKeys')});
        Radio.request('Layout', 'show', {view, region: 'modal'});
    }

    /**
     * serializeData.
     *
     * @returns {Object}
     */
    serializeData() {
        const models = this.collection.getConfigs();

        // There are no keys
        if (!models.privateKey.length) {
            return {models, keys: null};
        }

        // Read private and public keys
        this.keys = {};
        this.privateKey = openpgp.key.readArmored(models.privateKey).keys[0];

        _.each(models.publicKeys, (key, fingerprint) => {
            this.keys[fingerprint] = openpgp.key.readArmored(key).keys[0];
        });

        return {models, privateKey: this.privateKey, keys: this.keys};
    }

    templateContext() {
        return {
            /**
             * Return true if it's a user's personal key.
             *
             * @param {String} fingerprint
             * @returns {Boolean}
             */
            isPrivate(fingerprint) {
                return this.privateKey.primaryKey.fingerprint === fingerprint;
            },
        };
    }

}
