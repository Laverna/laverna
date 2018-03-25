/**
 * @module components/linkDialog/views/Collection
 */
import Mn from 'backbone.marionette';
import View from './Item';
import Radio from 'backbone.radio';

/**
 * Link dialog collection view.  Shows a list of notes.
 *
 * @class
 * @extends Marionette.CollectionView
 * @license MPL-2.0
 */
export default class Collection extends Mn.CollectionView {

    get tagName() {
        return 'ul';
    }

    get className() {
        return 'dropdown-menu';
    }

    get childViewContainer() {
        return '.dropdown-menu';
    }

    /**
     * Child view.
     *
     * @see module:components/linkDialog/views/Item
     * @prop {Object}
     */
    get childView() {
        return View;
    }

    events() {
        return {
            'click a': 'triggerAttach',
        };
    }

    /**
     * Trigger attach:link event.
     *
     * @param {Object} e
     */
    triggerAttach(e) {
        const id  = this.$(e.currentTarget).attr('data-id');
        const url = Radio.request('utils/Url', 'getNoteLink', {id});
        this.trigger('attach:link', {url: `#${url}`});
        return false;
    }

}
