/**
 * @module components/notebooks/list/views/Layout
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import Mousetrap from 'mousetrap';

import Notebooks from './Notebooks';
import Tags from './Tags';
import Sidebar from '../../../../behaviors/Sidebar';

/**
 * Notebooks list layout view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Layout extends Mn.View {

    get template() {
        const tmpl = require('../templates/layout.html');
        return _.template(tmpl);
    }

    /**
     * Behaviors.
     *
     * @see module:behaviors/Sidebar
     * @returns {Array}
     */
    get behaviors() {
        return [Sidebar];
    }

    /**
     * Do nothing on swipeleft event.
     *
     * @prop {Boolean} true
     */
    get noSwipeLeft() {
        return true;
    }

    /**
     * An array of keybinding names used in this view.
     *
     * @returns {Array}
     */
    get keybindings() {
        return [
            'actionsOpen'   , 'actionsEdit', 'actionsRemove',
            'navigateBottom', 'navigateTop',
        ];
    }

    /**
     * Regions.
     *
     * @returns {Object} - notebooks, tags
     */
    regions() {
        return {
            notebooks :  '#notebooks',
            tags      :  '#tags',
        };
    }

    constructor(...args) {
        super(...args);

        /**
         * Currently active region (notebooks for default).
         *
         * @prop {String}
         */
        this.activeRegion = this.options.notebooks.length ? 'notebooks' : 'tags';

        // Listen to collection events
        this.listenTo(this.options.notebooks.channel, 'page:end', this.switchToTags);
        this.listenTo(this.options.tags.channel, 'page:start', this.switchToNotebooks);
    }

    onDestroy() {
        const keys = _.pick(this.options.configs, this.keybindings);
        Mousetrap.unbind(_.values(keys));
    }

    /**
     * Render notebooks and tags view.
     */
    onRender() {
        const options = _.omit(this.options, 'notebooks', 'tags');

        // Start listening to keyboard events
        this.bindKeys();

        // Show notebooks
        this.showChildView('notebooks', new Notebooks(_.extend({
            collection: this.options.notebooks,
        }, options)));

        // Show tags
        this.showChildView('tags', new Tags(_.extend({
            collection: this.options.tags,
        }, options)));
    }

    /**
     * Bind keyboard shortcuts.
     */
    bindKeys() {
        _.each(this.keybindings, name => {
            Mousetrap.bind(this.options.configs[name], () => this[name]());
        });
    }

    /**
     * Open the currently active notebook/tag.
     */
    actionsOpen() {
        const $a = this.$('.list-group-item.active');
        this.navigateToLink($a);
    }

    /**
     * Find edit link of the currently active notebook/tag and navigate to it.
     */
    actionsEdit() {
        const $a = this.$('.list-group-item.active').parent()
        .find('.edit-link:first');
        this.navigateToLink($a);
    }

    /**
     * Navigate to a link.
     *
     * @param {Object} $a - <a> jQuery object.
     */
    navigateToLink($a) {
        Radio.request('utils/Url', 'navigate', {url: $a.attr('href')});
    }

    /**
     * Find remove link of the currently active notebook/tag and navigate to it.
     */
    actionsRemove() {
        const $a = this.$('.list-group-item.active').parent()
        .find('.remove-link:first');
        $a.trigger('click');
    }

    /**
     * Trigger navigate:next event on the currently active region's view.
     */
    navigateBottom() {
        this.getChildView(this.activeRegion).trigger('navigate:next');
    }

    /**
     * Trigger navigate:previous event on the currently active region's view.
     */
    navigateTop() {
        this.getChildView(this.activeRegion).trigger('navigate:previous');
    }

    /**
     * Make tags region active.
     */
    switchToTags() {
        this.switchRegion('tags');
        this.navigateBottom();
    }

    /**
     * Make notebooks region active.
     */
    switchToNotebooks() {
        this.switchRegion('notebooks');
        this.navigateTop();
    }

    /**
     * Switch to another region.
     *
     * @param {String} name - region name
     */
    switchRegion(name) {
        this.activeRegion = name;
        this.getChildView(this.activeRegion).options.filterArgs = {};
    }

    serializeData() {
        return this.options;
    }

}
