/**
 * @module views/Brand
 */
import Mn from 'backbone.marionette';

/**
 * The region that shows its content on fullscreen and on green background.
 *
 * @class
 * @extends Marionette.Region
 * @license MPL-2.0
 */
export default class Brand extends Mn.Region {

    /**
     * Show the region with animation.
     */
    onShow() {
        this.$el.slideDown('fast');
    }

    /**
     * Hide the region with animation.
     */
    onEmpty() {
        this.$el.slideUp('fast');
    }

}
