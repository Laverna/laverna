/**
 * @module behaviors/Sidebar
 */
import Mn from 'backbone.marionette';
import $ from 'jquery';
import Hammer from 'hammerjs';
import Radio from 'backbone.radio';

/**
 * Sidebar region behavior.
 *
 * @class
 * @extends Marionette.Behavior
 * @license MPL-2.0
 */
export default class Sidebar extends Mn.Behavior {

    /**
     * Stop listening to touch events.
     */
    onDestroy() {
        if (this.hammer) {
            this.hammer.destroy();
        }
    }

    /**
     * Start listening to touch events.
     */
    onRender() {
        this.hammer = new Hammer($('#sidebar--content')[0]);

        this.hammer.on('swiperight', () => this.onSwipeRight());
        this.hammer.on('swipeleft', () => this.onSwipeLeft());
    }

    /**
     * Show sidebar menu on swiperight.
     */
    onSwipeRight() {
        Radio.trigger('components/navbar', 'show:sidemenu');
    }

    /**
     * Switch to content region (hide sidebar) on swipeleft.
     */
    onSwipeLeft() {
        // Notebooks component does not use content region
        if (!this.view.noSwipeLeft) {
            Radio.request('Layout', 'toggleContent', {visible: true});
        }
    }

}
