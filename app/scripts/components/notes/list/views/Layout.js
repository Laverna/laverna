/**
 * @module components/notes/list/views/Layout
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import deb from 'debug';

import NotesView from './NotesView';
import Pagination from '../../../../behaviors/Pagination';
import Sidebar from '../../../../behaviors/Sidebar';

const log = deb('lav:components/notes/list/views/Layout');

/**
 * Sidebar layout that shows a list of notes.
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
     * @see module:behaviors/Pagination
     * @see module:behaviors/Sidebar
     * @returns {Array}
     */
    behaviors() {
        return [Sidebar, Pagination];
    }

    /**
     * Regions.
     *
     * @returns {Object}
     */
    regions() {
        return {
            notes: '.list',
        };
    }

    /**
     * Show notes collection view.
     */
    onRender() {
        log('rendering notes collection view', this.options);
        this.showChildView('notes', new NotesView(this.options));
    }

    templateContext() {
        return {
            collection: this.collection,
        };
    }

}
