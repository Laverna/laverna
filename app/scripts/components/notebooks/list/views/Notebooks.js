/**
 * @module components/notebooks/list/views/Notebooks
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import deb from 'debug';
import Notebook from './Notebook';
import Navigate from '../../../../behaviors/Navigate';

const log = deb('lav:components/notebooks/list/views/Notebooks');

/**
 * Notebooks collection view.
 *
 * @class
 * @extends Marionette.CollectionView
 * @license MPL-2.0
 */
export default class Notebooks extends Mn.CollectionView {

    get className() {
        return 'list--notebooks';
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
     * @see module:components/notebooks/list/views/Notebook
     * @returns {Object}
     */
    childView() {
        return Notebook;
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
        log('init');
        this.options.filterArgs = {};
    }

}
