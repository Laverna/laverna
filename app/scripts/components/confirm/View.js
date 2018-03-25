/**
 * @module components/confirm/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Mousetrap from 'mousetrap';

/**
 * Confirm view.
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

    /**
     * Events.
     *
     * @returns {Object}
     */
    events() {
        return {
            'click .modal-footer .btn': 'onBtnClick',
        };
    }

    /**
     * Bind tab key to switch between buttons.
     */
    initialize() {
        Mousetrap.bind('tab', () => this.focusNextBtn());
    }

    /**
     * Unbind tab key.
     */
    onBeforeDestroy() {
        Mousetrap.unbind(['tab']);
    }

    /**
     * Modal window is shown. Make the last button active.
     */
    onShownModal() {
        this.$('.btn:last').focus();
    }

    /**
     * Trigger an event if a button is clicked.
     *
     * @param {Object} e
     */
    onBtnClick(e) {
        const $btn = this.$(e.currentTarget);
        this.trigger('answer', {answer: $btn.attr('data-event')});
        return false;
    }

    /**
     * Focus on the button located next to the currently focused button.
     */
    focusNextBtn() {
        // If the next button does not exist, use the first button
        let $btn = this.$('.modal-footer .btn:focus').next();
        $btn     = $btn.length ? $btn : this.$('.modal-footer .btn:first');

        $btn.focus();
        return false;
    }

    serializeData() {
        return _.extend({
            buttons: [
                {event: 'reject', name: 'Cancel'},
                {event: 'confirm', name: 'OK', class: 'btn-success'},
            ],
        }, this.options);
    }

    templateContext() {
        return {
            getTitle() {
                return _.i18n(this.title || 'Are you sure?');
            },
        };
    }

}
