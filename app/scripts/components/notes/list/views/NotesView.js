/**
 * @module components/notes/list/views/NotesView
 */
import Mn from 'backbone.marionette';
import NoteView from './NoteView';
import Navigate from '../../../../behaviors/Navigate';

/**
 * Notes collection view.
 *
 * @class
 * @extends Marionette.CollectionView
 * @license MPL-2.0
 */
export default class NotesView extends Mn.CollectionView {

    /**
     * Listen to keybindings used for navigating between items (j-k).
     *
     * @see module:behaviors/Navigate
     * @returns {Boolean} true
     */
    get useNavigateKeybindings() {
        return true;
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
     * @see components/notes/list/views/NoteView
     * @returns {Object}
     */
    childView() {
        return NoteView;
    }

    /**
     * Child view options.
     *
     * @returns {Object}
     */
    childViewOptions() {
        return {filterArgs: this.options.filterArgs};
    }

}
