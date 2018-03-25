/**
 * @module components/setup/register/View
 */
import _ from 'underscore';
import View from '../ContentView';

/**
 * Register a new user on the signal server.
 *
 * @class
 * @extends module:components/setup/ContentView
 * @license MPL-2.0
 */
export default class Register extends View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    /**
     * Register a new account.
     *
     * @prop {Boolean}
     */
    get register() {
        return true;
    }

    ui() {
        return {
            next       : '#welcome--next',
            name       : 'input[name=name]',
            password   : 'input[name=password]',
            passwordRe : 'input[name=passwordRe]',
            alert      : '.alert',
            form       : '.form--register',
        };
    }

    triggers() {
        return {
            'click #welcome--previous': 'show:username',
        };
    }

    /**
     * Check if password and name fields aren't empty.
     * If they aren't, enable the "next" button.
     */
    onInputChange() {
        const isEmpty = !(
            this.ui.name.val().trim().length && this.checkPassword()
        );
        this.ui.next.attr('disabled', isEmpty);
    }

    /**
     * Return true if password is not empty.
     *
     * @returns {Boolean}
     */
    checkPassword() {
        const password = this.ui.password.val().trim();
        return password === this.ui.passwordRe.val() && password.length !== 0;
    }

    /**
     * Claim the username if "next" button is clicked.
     */
    onClickNext() {
        this.triggerMethod('save', {
            username : this.options.username,
            register : true,
            keyData  : {
                username   : this.ui.name.val().trim(),
                passphrase : this.ui.password.val().trim(),
            },
        });
    }

    /**
     * Hide the form and show "wait" block.
     */
    onSaveBefore() {
        this.ui.form.addClass('hidden');
        this.toggleWait();
    }

    onSaveError(data) {
        super.onSaveError(data);
        this.ui.form.removeClass('hidden');
        this.toggleWait();
    }

    /**
     * Show either the form or wait block.
     */
    toggleWait() {
        this.$('.welcome--wait').toggleClass('hidden');
    }

}
