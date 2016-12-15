/**
 * @module components/settings/show/encryption/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Behavior from '../Behavior';

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

    serializeData() {
        return {
            models: this.collection.getConfigs(),
        };
    }

    templateContext() {
        return {
            /**
             * Text used in the password placeholder.
             *
             * @returns {String}
             */
            passwordText() {
                if (this.models.encryptPass.length !== 0) {
                    return _.i18n('encryption.change password');
                }

                return _.i18n('encryption.provide password');
            },
        };
    }

}
