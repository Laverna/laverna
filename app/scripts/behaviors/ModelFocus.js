/**
 * @module behaviors/ModelFocus
 */
import Mn from 'backbone.marionette';
import $ from 'jquery';

/**
 * Handle navigation between models.
 *
 * @class
 * @extends Marionette.Behavior
 * @license MPL-2.0
 */
export default class ModelFocus extends Mn.Behavior {

    ui() {
        return {
            listGroup: '.list-group-item:first',
        };
    }

    modelEvents() {
        return {
            focus: 'onFocus',
        };
    }

    /**
     * The model is active (under focus).
     */
    onFocus() {
        $('.list-group-item.active').removeClass('active');
        this.ui.listGroup.addClass('active');
        this.view.trigger('scroll:top', {offset: this.ui.listGroup.offset()});
    }

}
