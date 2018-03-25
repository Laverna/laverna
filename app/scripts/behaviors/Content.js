/**
 * @module behaviors/Content
 */
import Mn from 'backbone.marionette';
import $ from 'jquery';
import Hammer from 'hammerjs';
import Radio from 'backbone.radio';

/**
 * Content region behavior.
 * It allows to show only one region on small screens (either content or sidebar)
 *
 * @class
 * @extends Marionette.Behavior
 * @license MPL-2.0
 */
export default class Content extends Mn.Behavior {

    events() {
        return {
            'click #show--sidebar': 'showSidebar',
        };
    }

    /**
     * If a content view is destroyed, show the sidebar.
     */
    onDestroy() {
        if (this.$active) {
            this.$active.off('click');
        }

        if (this.hammer) {
            this.hammer.destroy();
        }

        this.showSidebar();
    }

    /**
     * Show content region.
     */
    onRender() {
        this.showContent();
        this.listenToHammer();
        this.listenActive();
    }

    /**
     * Listen to touch events.
     */
    listenToHammer() {
        this.hammer = new Hammer(this.view.$el[0]);
        this.hammer.on('swiperight', () => this.showSidebar());
    }

    /**
     * Show content again if a user clicks on an already active element.
     */
    listenActive() {
        if (!this.$active || !this.$active.length) {
            this.$active = $('.list--item.active, .list--settings.active');
            this.$active.on('click', () => this.showContent());
        }
    }

    /**
     * Hide content and show the sidebar.
     */
    showSidebar() {
        Radio.request('Layout', 'toggleContent', {visible: false});
    }

    /**
     * Hide sidebar and show content.
     */
    showContent() {
        Radio.request('Layout', 'toggleContent', {visible: true});
    }

}
