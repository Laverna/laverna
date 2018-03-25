/**
 * @module components/Notes/controller
 * @license MPL-2.0
 */
import _ from 'underscore';
import deb from 'debug';
import Radio from 'backbone.radio';

import List from './list/Controller';
import Show from './show/Controller';
import Form from './form/Controller';
import './remove/Controller';

const log = deb('lav:components/notes/controller');

export default {

    /**
     * Router parameters.
     *
     * @returns {Object}
     */
    get options() {
        return this._args || {};
    },

    /**
     * Update router parameters.
     *
     * @param {Array} args
     * @returns {Object}
     */
    set options(args) {
        this._argsOld = this._args;
        this._args    = {
            filter    : args[0] || 'active',
            query     : args[1],
            page      : args[2],
            id        : args[3],
        };
    },

    /**
     * Show a list of notes in the sidebar.
     */
    showNotes(...args) {
        this.options = args;

        // Don't instantiate the controller if filter paramaters are the same
        if (!this.filterHasChanged()) {
            return log('dont render notes sidebar');
        }

        log('showNotes', this.options);
        const controller = new List({filterArgs: this.options});
        controller.once('destroy', () => this.onListDestroy());
        return controller.init();
    },

    /**
     * Reset filter options once a user navigates to another component's page
     * (notebooks, settings, etc.)
     */
    onListDestroy() {
        const url = Radio.request('utils/Url', 'getHash');

        if (url.search('notes') === -1) {
            log('reset options');
            this.options = [];
        }
    },

    /**
     * Check if filters have changed.
     *
     * @returns {Boolean}
     */
    filterHasChanged() {
        return !_.isEqual(
            _.omit(this.options, 'id', 'page'),
            _.omit(this._argsOld || {}, 'id', 'page')
        );
    },

    /**
     * Show a particular note.
     *
     * @param {Array} ...args
     * @todo show the note view
     */
    showNote(...args) {
        // Show the sidebar
        this.showNotes(...args);

        // Show the note
        log('show the note');
        new Show(this.options).init();
    },

    /**
     * Add/edit a note.
     *
     * @param {String} id
     */
    showForm(id) {
        // Show the sidebar if it isn't shown yet
        if (_.isEmpty(this.options)) {
            this.showNotes(id);
        }

        log('showForm', {id});
        new Form(_.extend({}, this.options, {id})).init();
    },

};
