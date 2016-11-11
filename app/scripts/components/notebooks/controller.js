/**
 * @module components/notebooks/controller
 * @license MPL-2.0
 */
import deb from 'debug';

const log = deb('lav:components/notebooks/controller');

export default {

    /**
     * Show a list of notebooks and tags.
     *
     * @param {String} profileId
     */
    showList(profileId) {
        log('showList', {profileId});
    },

    /**
     * Show notebook form.
     *
     * @param {String} profileId
     * @param {String} [id] - ID of a notebook
     */
    notebookForm(profileId, id) {
        log('notebookForm', {profileId, id});
    },

    /**
     * Tag form.
     *
     * @param {String} profileId
     * @param {String} [id]
     */
    tagForm(profileId, id) {
        log('tagForm', {profileId, id});
    },

};
