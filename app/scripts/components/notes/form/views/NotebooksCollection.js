/**
 * @module components/notes/form/views/NotebooksCollection
 */
import Mn from 'backbone.marionette';
import Notebook from './Notebook';

/**
 * Notebooks collection view.
 *
 * @class
 * @extends Marionette.CollectionView
 * @license MPL-2.0
 */
export default class NotebooksCollection extends Mn.CollectionView {

    /**
     * Child view.
     *
     * @see modules:components/notes/form/views/Notebook
     * @returns {Object}
     */
    childView() {
        return Notebook;
    }

}
