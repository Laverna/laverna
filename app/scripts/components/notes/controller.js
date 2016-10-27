/**
 * @module components/Notes/controller
 * @license MPL-2.0
 */
import _ from 'underscore';
import deb from 'debug';

import List from './list/Controller';

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
            profileId : args[0],
            filter    : args[1],
            query     : args[2],
            page      : args[3],
            id        : args[4],
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
        new List({filterArgs: this.options}).init();
    },

    /**
     * Check if filters have changed.
     *
     * @returns {Boolean}
     */
    filterHasChanged() {
        return !_.isEqual(
            _.omit(this.options, 'id'),
            _.omit(this._argsOld || {}, 'id')
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
        log('showNote', {id: args[4]});
    },

    showForm() {
        log('showForm');
    },

};
