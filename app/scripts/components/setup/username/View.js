/**
 * @module components/setup/username/View
 */
import _ from 'underscore';
import View from '../ContentView';

/**
 * Ask for a user name.
 *
 * @class
 * @extends module:components/setup/ContentView
 * @license MPL-2.0
 */
export default class Username extends View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    ui() {
        return {
            username: 'input[name=username]',
            next    : '#welcome--next',
            warning : '.welcome--warning',
            alert   : '.alert',
        };
    }

    /**
     * Disable "next" button if username is empty.
     */
    onInputChange() {
        this.ui.next.attr('disabled', !this.ui.username.val().length);
    }

    /**
     * Check if a username is free.
     */
    onClickNext() {
        this.triggerMethod('check:user', {
            username: this.ui.username.val().trim(),
        });
    }

    /**
     * If the username isn't free, enable all button and
     * show key pair upload button.
     */
    onNameTaken({user}) {
        this.options.user = user;
        this.ui.warning.removeClass('hidden');
        this.ui.alert.text(_.i18n(`This username is taken.
            If it was you who claimed this username, upload your key pair
            or try another username.`));
    }

    /**
     * Before saving the key, check if the fingerprint matches
     * the fingerprint on the signaling server.
     *
     * @param {Object} {key}
     */
    onReadyKey({key}) {
        const isEqual = this.options.user.fingerprint === key.primaryKey.fingerprint;

        if (isEqual) {
            return super.onReadyKey({key});
        }

        return this.ui.alert.text(_.i18n(`You selected a wrong key!
            Perhaps it is not your account.`));
    }

}
