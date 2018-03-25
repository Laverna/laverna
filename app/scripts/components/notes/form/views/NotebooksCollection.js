/**
 * @module components/notes/form/views/NotebooksCollection
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Notebook from './Notebook';

/**
 * Notebooks collection view.
 *
 * @class
 * @extends Marionette.CollectionView
 * @license MPL-2.0
 */
export default class NotebooksCollection extends Mn.CollectionView {

    get tagName() {
        return 'optgroup';
    }

    get className() {
        return 'editor--notebooks--select';
    }

    /**
     * Child view.
     *
     * @see modules:components/notes/form/views/Notebook
     * @returns {Object}
     */
    childView() {
        return Notebook;
    }

    onRender() {
        this.$el.attr('label', _.i18n('Notebooks'));
    }

}
