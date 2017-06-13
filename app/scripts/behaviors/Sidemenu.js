/**
 * @module behaviors/Sidemenu
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';
import Hammer from 'hammerjs';
import Mousetrap from 'mousetrap';
import Radio from 'backbone.radio';

/**
 * Hamburger menu behavior.
 *
 * @class
 * @extends Marionette.Behavior
 * @license MPL-2.0
 */
export default class Sidemenu extends Mn.Behavior {

    ui() {
        return {
            sidemenu: '.sidemenu',
        };
    }

    events() {
        return {
            'click .sidemenu--open'  : 'showMenu',
            'click .sidemenu--close' : 'hideMenu',
            'click .sidemenu a'      : 'hideMenu',
        };
    }

    initialize() {
        /**
         * Hammer events. If the view has smenuHammerEvents property,
         * it will override the behavior's.
         *
         * @prop {Object}
         * @prop {String} swiperight - show the menu
         * @prop {String} swipeleft - hide the menu
         */
        this.hammerEvents = this.view.smenuHammerEvents || {
            swiperight: 'showMenu',
            swipeleft : 'hideMenu',
        };

        this.listenTo(this.view.channel, 'show:sidemenu', this.showMenu);
        this.listenTo(Radio.channel('utils/Keybindings'), 'appShowSidemenu',
            this.showMenu);
    }

    onDestroy() {
        if (this.hammer) {
            this.hammer.destroy();
            this.hammer2.destroy();
        }
    }

    onRender() {
        this.$backdrop = $('#layout--backdrop');
        this.listenToHammer();
    }

    /**
     * Listen to hammerjs events.
     */
    listenToHammer() {
        // To avoid bugginess, add hammer events to the backdrop el too
        this.hammer  = new Hammer(this.$backdrop[0]);
        this.hammer2 = new Hammer(this.$el[0]);

        _.each(this.hammerEvents, (method, evt) => {
            const func = _.bind(this.view[method] || this[method], this);
            this.hammer.on(evt, func);
            this.hammer2.on(evt, func);
        });
    }

    /**
     * Show the menu.
     */
    showMenu() {
        // Show the menu and backdrop
        this.ui.sidemenu.addClass('-show');
        this.$backdrop.addClass('-show');

        // Reset the scroll position
        this.ui.sidemenu.scrollTop(0);

        // Hide the menu if Escape is pressed
        Mousetrap.bind('esc', () => this.hideMenu());

        this.$backdrop.on('click', () => this.onBackdropClick());
        return false;
    }

    /**
     * Hide the menu if the backdrop is clicked.
     */
    onBackdropClick() {
        this.hideMenu();
        this.$backdrop.off('click');
    }

    /**
     * Hide the menu.
     */
    hideMenu(e) {
        // Don't prevent the default behavior if a link is clicked
        if (e && !$(e.currentTarget).hasClass('sidemenu--item')) {
            e.preventDefault();
        }
        this.ui.sidemenu.removeClass('-show');
        this.$backdrop.removeClass('-show');
    }

}
