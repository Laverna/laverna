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

    events() {
        return {
            'click #btn--privateKey' : 'showPrivateKey',
            'click #btn--passphrase' : 'showPasswordView',
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
        const view = new Passphrase({model: this.collection.get('privateKey')});
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
            return {models};
        }

        // Read the private key
        this.privateKey = openpgp.key.readArmored(models.privateKey).keys[0];
        return {models, privateKey: this.privateKey};
    }

}
