/**
 * @module components/notebooks/controller
 * @license MPL-2.0
 */
import deb from 'debug';
// import Radio from 'backbone.radio';

import List from './list/Controller';
import NotebookForm from './form/notebook/Controller';
import TagForm from './form/tag/Controller';
import './remove/Controller';

const log = deb('lav:components/notebooks/controller');

export default {
           

    /**
     * Show a list of notebooks and tags.
     */
    showList() {
        log('showList');
        return new List().init();
    },

    /**
     * Show notebook form.
     *
     * @param {String} [id] - ID of a notebook
     * @param {Object} [promise] - the promise will be resolved once
     * a new notebook is created
     */
    notebookForm(id, promise) {
        log('notebookForm', {id});
        return new NotebookForm({id, promise}).init();
    },

    /**
     * The method is called once notebookForm request is made.
     *
     * @param {Object} options
     * @returns {Promise} resolved once a new notebook is created
     */
    notebookFormReply(options) {
        return new Promise((resolve, reject) => {
            this.notebookForm(options.id, {resolve, reject});
        });
    },

    /**
     * Tag form.
     *
     * @param {String} [id]
     */
    tagForm(id) {
        log('tagForm', {id});
        return new TagForm({id}).init();
    },


    /**
     * The method is called once notebookForm request is made.
     *
     * @param {Object} options
     * @returns {Promise} resolved once a new notebook is created
     */
    tagFormReply(options) {
        this.tagForm(options.id);
    },
};
