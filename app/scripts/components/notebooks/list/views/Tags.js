/**
 * @module components/notebooks/list/views/Tags
 */
import Mn from 'backbone.marionette';
import Tag from './Tag';
import _ from 'underscore';
import Navigate from '../../../../behaviors/Navigate';

/**
 * Tags collection view.
 *
 * @class
 * @extends Marionette.CollectionView
 * @license MPL-2.0
 */
export default class Tags extends Mn.CollectionView {

    get className() {
        return 'list list--tags';
    }

    /**
     * Behaviors.
     *
     * @see module:behaviors/Navigate
     * @returns {Array}
     */
    behaviors() {
        return [Navigate];
    }

    /**
     * Child view.
     *
     * @see module:components/notebooks/list/views/Tag
     * @returns {Object}
     */
    childView() {
        return Tag;
    }

    /**
     * Child view options.
     *
     * @returns {Object}
     */
    childViewOptions() {
        return _.omit(this.options, 'collection');
    }

    initialize() {
        this.options.filterArgs = {};

        // Collection channel events
        this.listenTo(this.collection.channel, 'page:next', this.getNextPage);
    }

    /**
     * Show models from the next page.
     */
    getNextPage() {
        this.collection.pagination.current += 1;
        this.collection.getNextPage();
    }

}
