/**
 * @module components/settings/show/encryption/Key
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import deb from 'debug';

const log = deb('lav:components/settings/show/encryption/Key');

/**
 * Show private/public key information.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Key extends Mn.View {

    get template() {
        const tmpl = require('./key.html');
        return _.template(tmpl);
    }

    get className() {
        return 'modal fade';
    }

    ui() {
        return {
            text: 'textarea',
        };
    }

    events() {
        return {
            'focus @ui.text'    : 'selectAll',
            'click .btn--cancel': 'destroy',
            'click .btn--remove': 'removeKey',
        };
    }

    /**
     * Select everything in the textarea.
     */
    selectAll() {
        this.ui.text.select();
    }

    /**
     * Remove the public key.
     *
     * @returns {Promise}
     */
    removeKey() {
        return Radio.request('collections/Configs', 'removePublicKey', {
            publicKey : this.options.key.armor(),
            model     : this.model,
        })
        .then(() => this.destroy())
        .catch(err => log('error', err));
    }

    serializeData() {
        return this.options;
    }

    templateContext() {
        return {
            /**
             * Show armored key.
             *
             * @returns {String}
             */
            getArmor() {
                return this.model.get('value')[this.key.primaryKey.fingerprint];
            },

            /**
             * Return key fingerprint.
             *
             * @returns {String}
             */
            getFingerprint() {
                return this.key.primaryKey.fingerprint.match(/.{4}/g).join(' ');
            },

            /**
             * Return algorithm type (RSA)
             *
             * @returns {String}
             */
            getType() {
                return this.key.primaryKey.algorithm.split('_')[0];
            },
        };
    }

}
