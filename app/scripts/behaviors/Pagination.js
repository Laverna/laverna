/**
 * @module behaviors/Pagination
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

/**
 * Pagination behavior.
 *
 * @class
 * @extends Marionette.Behavior
 * @license MPL-2.0
 */
export default class Pagination extends Mn.Behavior {

    ui() {
        return {
            pageNav  : '#pageNav',
            prevPage : '#prevPage',
            nextPage : '#nextPage',
        };
    }

    events() {
        return {
            'click @ui.nextPage' : 'getNextPage',
            'click @ui.prevPage' : 'getPreviousPage',
        };
    }

    collectionEvents() {
        return {
            reset: 'updatePaginationButtons',
        };
    }

    initialize() {
        this.options    = this.view.options;
        this.collection = this.options.collection;

        this.listenTo(this.collection.channel, 'page:next', this.getNextPage);
        this.listenTo(this.collection.channel, 'page:previous', this.getPreviousPage);
    }

    /**
     * Update pagination buttons states (disabled) or hide them.
     */
    updatePaginationButtons() {
        this.ui.pageNav.toggleClass('hidden', this.collection.pagination.total === 0);
        this.ui.prevPage.toggleClass('disabled', !this.collection.hasPreviousPage());
        this.ui.nextPage.toggleClass('disabled', !this.collection.hasNextPage());
    }

    /**
     * Show models from the next page.
     */
    getNextPage() {
        if (this.collection.hasNextPage()) {
            this.navigatePage(1);
            this.collection.getNextPage();
        }
    }

    /**
     * Show models from the previous page.
     */
    getPreviousPage() {
        if (this.collection.hasPreviousPage()) {
            this.navigatePage(-1);
            this.collection.getPreviousPage();
        }
    }

    /**
     * Saves page status in window.location.
     *
     * @param {Number} number
     */
    navigatePage(number) {
        this.options.filterArgs.page = this.collection.pagination.current + number;

        Radio.request('utils/Url', 'navigate', {
            trigger    : false,
            filterArgs : this.options.filterArgs,
        });
    }

}
