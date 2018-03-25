/**
 * @module components/settings/show/encryption/Key
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

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
        };
    }

    /**
     * Select everything in the textarea.
     */
    selectAll() {
        this.ui.text.select();
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
                const key = this.isPrivate ? this.key.toPublic() : this.key;
                return key.armor();
            },

            /**
             * Return key fingerprint.
             *
             * @returns {String}
             */
            getFingerprint() {
                return _.splitBy4(this.key.primaryKey.fingerprint);
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
