/**
 * @module components/fuzzySearch/views/Region
 */
import Mn from 'backbone.marionette';
import $ from 'jquery';

/**
 * Fuzzy search region.
 *
 * @class
 * @extends Marionette.Region
 * @license MPL-2.0
 */
export default class Region extends Mn.Region {

    /**
     * Show the region block.
     */
    onShow() {
        this.$body = this.$body || $('body');
        this.$body.addClass('-fuzzy');
        this.$el.removeClass('hidden');
    }

    /**
     * Hide the region block.
     */
    onEmpty() {
        this.$el.addClass('hidden');
        this.$body.removeClass('-fuzzy');
    }

}
