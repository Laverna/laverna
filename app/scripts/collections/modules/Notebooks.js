/**
 * @module collections/modules/Notebooks
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import Module from './Module';
import Collection from '../Notebooks';

/**
 * Notebook collection module.
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Notebooks extends Module {

    /**
     * Notebooks collection.
     *
     * @see module:collections/Notebooks
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    /**
     * Remove a notebook. Before removing a notebook, it does the following:
     * 1. Moves child notebook models to a higher level by changing parentId.
     * 2. Removes notes attached to the notebook or changes their notebookId to 0.
     *
     * @param {Object} options
     * @param {Object} options.model - notebook model
     * @param {Boolean} (options.removeNotes) - true if attached notes should be
     * removed too
     * @returns {Promise}
     */
    async remove(options) {
        await this.updateChildren(options.model);
        await Radio.request('collections/Notes', 'changeNotebookId', options);

        return super.remove(options);
    }

    /**
     * Move child notebooks to a higher level.
     *
     * @param {Object} model - notebook model
     * @returns {Promise}
     */
    async updateChildren(model) {
        const profileId  = model.profileId;
        const collection = await this.getChildren({parentId: model.id, profileId});

        const promises = [];
        const data     = {parentId: model.get('parentId')};

        collection.each(notebook => {
            promises.push(this.saveModel({data, model: notebook}));
        });

        return Promise.all(promises);
    }

    /**
     * Find child notebooks.
     *
     * @param {Object} options - Promise
     * @param {String} options.parentId - ID of the parent notebook
     * @param {String} options.profileId - profile name
     */
    getChildren(options) {
        const {parentId, profileId} = options;

        // Filter an existing collection
        if (this.collection && this.collection.length) {
            const collection = this.collection.clone();
            collection.reset(collection.getChildren(parentId));
            return Promise.resolve(collection);
        }

        return this.find({profileId, conditions: {parentId}});
    }

    /**
     * Find notebooks. It overrides the parent method to build a tree
     * structure after fetching models.
     *
     * @param {Object} options
     * @returns {Promise}
     */
    async find(options) {
        const sortField = Radio.channel('collections/Configs').request(
            'findConfig', {name: 'sortnotebooks'}
        );
        const opt        = _.extend({sortField}, options);
        const collection = await super.find(opt);

        collection.models = collection.getTree();
        return collection;
    }

}
