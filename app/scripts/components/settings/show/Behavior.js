/**
 * @module components/settings/show/Behavior
 */
import Mn from 'backbone.marionette';

/**
 * Behavior for settings tab views.
 *
 * @class
 * @extends Marionette.Behavior
 * @license MPL-2.0
 */
export default class Behavior extends Mn.Behavior {

    /**
     * Events.
     *
     * @returns {Object}
     */
    events() {
        return {
            'input input, select, textarea' : 'triggerChange',
            'change input, select, textarea': 'triggerChange',
            'change .show-onselect'   : 'showOnSelect',
            'click .showField'        : 'showOnCheck',
        };
    }

    /**
     * Trigger change:value event.
     *
     * @param {Object} e
     */
    triggerChange(e) {
        const $el    = this.view.$(e.currentTarget);
        const config = {name: $el.attr('name')};

        if (!config.name) {
            return;
        }

        if ($el.attr('type') !== 'checkbox') {
            config.value = $el.val().trim();
        }
        else {
            config.value = ($el.is(':checked')) ? 1 : 0;
        }

        this.view.trigger('change:value', config);
    }

    /**
     * Show additional parameters if an option is selected.
     *
     * @param {Object} e
     */
    showOnSelect(e) {
        const $el     = this.view.$(e.currentTarget);
        const $option = $el.find(`option[value=${$el.attr('data-option')}]`);
        const isSelected = $option.is(':selected');

        this.view.$($option.attr('data-show')).toggleClass('hidden', !isSelected);
    }

    /**
     * Show fieldsets with additional parameters after a checkbox is checked.
     *
     * @param {Object} e
     */
    showOnCheck(e) {
        const $el    = this.view.$(e.currentTarget);
        const $field = this.view.$($el.attr('data-field'));
        const isChecked = $el.is(':checked');
        $field.toggleClass('hidden', !isChecked);
    }

}
