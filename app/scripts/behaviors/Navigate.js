/**
 * @module behaviors/Navigate
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';
import Mousetrap from 'mousetrap';
import deb from 'debug';

const log = deb('lav:behaviors/Navigate');

/**
 * Handle navigation between models. The behavior handles the following:
 * - Making elements active;
 * - Navigating between models with keybindings (j-k);
 * - Updating the scroll position;
 *
 * @class
 * @extends Marionette.Behavior
 * @license MPL-2.0
 */
export default class Navigate extends Mn.Behavior {

    initialize() {
        this.collection = this.view.options.collection;
        this.configs    = this.view.options.configs;
        this.$scroll    = $('#sidebar .-scroll');

        // Listen to keybinding events
        if (this.view.useNavigateKeybindings) {
            this.bindKeys();
        }

        this.onModelNavigate = _.debounce(this.onModelNavigate, 10);

        // Listen to model:navigate event
        this.listenTo(this.collection.channel, 'model:navigate', _.debounce((...args) => {
            this.onModelNavigate(...args);
        }, 10));

        if (this.view.channel) {
            this.listenTo(this.view.channel, 'model:active', this.onModelNavigate);
        }

        // Child view events
        this.listenTo(this.view, 'childview:scroll:top', this.onScrollTop);
        this.listenTo(this.view, 'navigate:next', this.navigateNextModel);
        this.listenTo(this.view, 'navigate:previous', this.navigatePreviousModel);
    }

    /**
     * Start listening to keybinding events.
     */
    bindKeys() {
        log('listen to keybindings');
        Mousetrap.bind(this.configs.navigateBottom, () => this.navigateNextModel());
        Mousetrap.bind(this.configs.navigateTop, () => this.navigatePreviousModel());
    }

    /**
     * Stop listening to keybinding events.
     */
    onDestroy() {
        if (this.view.useNavigateKeybindings) {
            Mousetrap.unbind([
                this.configs.navigateBottom,
                this.configs.navigateTop,
            ]);
        }
    }

    /**
     * Change the scroll position.
     *
     * @param {Object} options
     * @param {Object} options.offset
     */
    onScrollTop(options) {
        this.$scroll.scrollTop(
            options.offset.top -
            this.$scroll.offset().top + this.$scroll.scrollTop() - 100
        );
    }

    /**
     * Open the next model.
     */
    navigateNextModel() {
        log('navigate to the next model');
        this.collection.navigateNextModel(this.view.options.filterArgs.id);
    }

    /**
     * Open the previous model.
     */
    navigatePreviousModel() {
        log('navigate to the previous model');
        this.collection.navigatePreviousModel(this.view.options.filterArgs.id);
    }

    /**
     * Make the provided model active.
     *
     * @param {Object} data
     * @param {Object} data.model
     */
    onModelNavigate(data) {
        const model = this.collection.get(data.model.id);
        this.view.options.filterArgs.id = model.id;
        model.trigger('focus');
    }

}
