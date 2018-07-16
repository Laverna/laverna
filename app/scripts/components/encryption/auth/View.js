/**
 * @module components/encryption/auth/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * Auth view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    ui() {
        return {
            password : 'input[name=password]',
            username : 'select[name=username]',
            btn      : '.btn[type=submit]',
        };
    }

    triggers() {
        return {
            'submit .form-wrapper' : 'submit',
            'click .btn--setup'    : 'setup',
        };
    }

    serializeData() {
        return {
            profiles: this.options.profiles.toJSON(),
        };
    } 

    /**
     * Focus on password input.
     */
    onReady() {
        this.ui.btn.css('position', 'relative');
        this.ui.password.focus();
    }

    /**
     * Password is wrong.
     */
    onAuthError() {
        this.ui.password.val('').focus();

        // Shake the button 2 times
        this
        .animateBtn()
        .animateBtn();
    }

    /**
     * Shake the submit button to indicate that the password is incorrect.
     *
     * @returns {Object} this
     */
    animateBtn() {
        this.ui.btn
        .animate({left: -10}, 60)
        .animate({left: 10}, 60)
        .animate({left: 0}, 60);

        return this;
    }

}
