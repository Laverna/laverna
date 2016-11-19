/**
 * @module components/notebooks/controller
 * @license MPL-2.0
 */
import deb from 'debug';

import List from './list/Controller';
import NotebookForm from './form/notebook/Controller';
import TagForm from './form/tag/Controller';
import './remove/Controller';

const log = deb('lav:components/notebooks/controller');

export default {

    /**
     * Show a list of notebooks and tags.
     *
     * @param {String} profileId
     */
    showList(profileId) {
        log('showList', {profileId});
        return new List({profileId}).init();
    },

    /**
     * Show notebook form.
     *
     * @param {String} profileId
     * @param {String} [id] - ID of a notebook
     * @param {Object} [promise] - the promise will be resolved once
     * a new notebook is created
     */
    notebookForm(profileId, id, promise) {
        log('notebookForm', {profileId, id});
        return new NotebookForm({id, profileId, promise}).init();
    },

    /**
     * The method is called once notebookForm request is made.
     *
     * @param {Object} options
     * @param {Object} options.profileId
     * @returns {Promise} resolved once a new notebook is created
     */
    notebookFormReply(options) {
        return new Promise((resolve, reject) => {
            this.notebookForm(options.profileId, options.id, {resolve, reject});
        });
    },

    /**
     * Tag form.
     *
     * @param {String} profileId
     * @param {String} [id]
     */
    tagForm(profileId, id) {
        log('tagForm', {profileId, id});
        return new TagForm({id, profileId}).init();
    },

};
