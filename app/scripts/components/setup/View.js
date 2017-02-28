/**
 * @module components/help/firstStart/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * First start help view.
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

    get className() {
        return 'modal fade';
    }

    ui() {
        return {
            page         : '#welcome--page',
            settings     : '#welcome--settings',
            wait         : '#welcome--wait',
            password     : 'input[name="password"]',
            passwordRe   : 'input[name="passwordRe"]',
            email        : 'input[name=email]',
            name         : 'input[name=name]',
            saveBtn      : '#welcome--save',
        };
    }

    triggers() {
        return {
            'click #welcome--import' : 'import',
            'click @ui.saveBtn'      : 'save',
            'click #welcome--export' : 'download',
        };
    }

    events() {
        return {
            'keyup @ui.email'            : 'onInputChange',
            'keyup input[type=password]' : 'onInputChange',
            'click #welcome--previous'   : 'onPrevious',
            'click #welcome--next'       : 'onNext',
            'click #welcome--last'       : 'destroy',
        };
    }

    /**
     * Check if email is empty.
     */
    onInputChange() {
        this.checkForm();
    }

    /**
     * Check if email and password are provided.
     */
    checkForm() {
        if (this.ui.email.val().trim().length && this.checkPassword()) {
            this.ui.saveBtn.removeAttr('disabled');
        }
        else {
            this.ui.saveBtn.attr('disabled', true);
        }
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
     * Show the first page and hide settings page.
     */
    onPrevious() {
        this.ui.page.removeClass('hidden');
        this.ui.settings.addClass('hidden');
    }

    /**
     * Show settings page after a user clicks on "next" button.
     */
    onNext() {
        this.ui.page.addClass('hidden');
        this.ui.settings.removeClass('hidden');
    }

    /**
     * After saving settings, show backup buttons.
     */
    onSaveBefore() {
        this.ui.settings.addClass('hidden');
        this.ui.wait.removeClass('hidden');
    }

    /**
     * After saving settings, show backup buttons.
     */
    onSaveAfter() {
        this.ui.wait.addClass('hidden');
        this.$('#welcome--backup').removeClass('hidden');
    }

}
