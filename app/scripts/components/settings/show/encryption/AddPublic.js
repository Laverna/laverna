/**
 * @module components/settings/show/encryption/AddPublic
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';

/**
 * Add a new public key.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class AddPublic extends Mn.View {

    get template() {
        const tmpl = require('./addPublic.html');
        return _.template(tmpl);
    }

    get className() {
        return 'modal fade';
    }

    ui() {
        return {
            publicKey: '#publicKey',
            alert    : '.alert',
        };
    }

    events() {
        return {
            'click .btn--cancel' : 'destroy',
            'click .btn--save'   : 'save',
        };
    }

    onShownModal() {
        this.ui.publicKey.focus();
    }

    /**
     * Save the public key.
     *
     * @returns {Promise}
     */
    save() {
        const publicKey = this.ui.publicKey.val().trim();

        return Radio.request('collections/Configs', 'addPublicKey', {
            publicKey,
            model: this.model,
        })
        .then(() => this.destroy())
        .catch(err => this.onSaveError(err));
    }

    /**
     * Failed to save the public key.
     *
     * @param {String} err
     */
    onSaveError(err) {
        this.ui.alert.text(err).removeClass('hidden');
        return this.ui.publicKey.focus();
    }

}
