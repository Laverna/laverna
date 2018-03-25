/**
 * @module components/settings/show/encryption/Passphrase
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';

const log = deb('lav:components/settings/show/encryption/Passphrase');

/**
 * Change passphrase of the private key.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Passphrase extends Mn.View {

    get template() {
        const tmpl = require('./passphrase.html');
        return _.template(tmpl);
    }

    get className() {
        return 'modal fade';
    }

    ui() {
        return {
            oldPassphrase   : '#oldPassphrase',
            newPassphrase   : '#newPassphrase',
            newPassphraseRe : '#newPassphraseRe',
            helpError       : '.help--error',
        };
    }

    events() {
        return {
            'click .btn--cancel' : 'destroy',
            'click .btn--save'   : 'save',
            'keyup input'        : 'saveOnEnter',
        };
    }

    /**
     * Save the passphrase if a user presses "enter".
     *
     * @param {Object} e
     */
    saveOnEnter(e) {
        if (e.which === 13) {
            return this.save();
        }
    }

    /**
     * Change the passphrase and save updated private key.
     *
     * @returns {Promise}
     */
    save() {
        if (this.ui.newPassphrase.val() !== this.ui.newPassphraseRe.val()) {
            return this.onChangeError('Passwords do not match');
        }

        return Radio.request('collections/Profiles', 'changePassphrase', {
            model        : this.model,
            oldPassphrase: this.ui.oldPassphrase.val().trim(),
            newPassphrase: this.ui.newPassphrase.val().trim(),
        })
        .then(() => document.location.reload())
        .catch(err => this.onChangeError(err));
    }

    /**
     * Changing the passphrase failed.
     */
    onChangeError(err) {
        log('error', err);
        if (typeof err === 'string') {
            this.ui.helpError.text(_.i18n(err));
        }
    }

}
