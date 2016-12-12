/**
 * @module views/Modal
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import $ from 'jquery';

/**
 * Modal region.
 *
 * @class
 * @extends Marionette.Region
 * @license MPL-2.0
 */
export default class Modal extends Mn.Region {

    /**
     * Radio channel.
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('views/Modal');
    }

    /**
     * Show the modal window.
     */
    onShow() {
        this.currentView.$el.modal({
            show     : true,
            backdrop : 'static',
            keyboard : true,
        });

        this.currentView.$el.on('shown.bs.modal', () => this.onModalShown());
        this.currentView.$el.on('hidden.bs.modal', () => this.onModalHidden());
        this.channel.trigger('shown');
    }

    /**
     * Trigger "shown:modal" event after showing the modal window.
     */
    onModalShown() {
        this.currentView.triggerMethod('shown:modal');
    }

    /**
     * Empty the region immediately after closing the modal window.
     */
    onModalHidden() {
        this.empty();
    }

    /**
     * Hide the modal window before emptying the region.
     */
    onBeforeEmpty() {
        this.currentView.$el.off(['hidden.bs.modal', 'shown.bs.modal']);
        this.currentView.$el.modal('hide');
        this.removeBackdrop();
        this.channel.trigger('hidden');
    }

    /**
     * Remove modal backdrop if it is still there.
     */
    removeBackdrop() {
        const $backdrop = $('.modal-backdrop');

        if ($backdrop.length) {
            $backdrop.remove();
        }
    }

}
