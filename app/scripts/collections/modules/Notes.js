/**
 * @module module:collections/modules/Notes
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import Module from './Module';
import Collection from '../Notes';

/**
 * Notes collection module.
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Notes extends Module {

    /**
     * Notes collection.
     *
     * @see module:collections/Notes
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    constructor() {
        super();

        this.channel.reply({
            restore          : this.restore,
            changeNotebookId : this.changeNotebookId,
        }, this);
    }

    /**
     * Save a note model. Override the parent method to create/save tags
     * before saving the note model.
     *
     * @param {Object} options
     * @param {Object} options.model - note model
     * @param {Object} (options.data) - new data
     * @param {Boolean} (options.saveTags) - true if tags should be extracted
     * from the content and saved.
     * @returns {Promise}
     */
    saveModel(options) {
        if (_.isUndefined(options.saveTags) || !options.saveTags) {
            return super.saveModel(options);
        }

        const data = options.data || options.model.attributes;

        return Radio.request('collections/Tags', 'addTags', {
            tags      : data.tags,
            profileId : options.model.profileId,
        })
        .then(() => super.saveModel(options));
    }

    /**
     * Remove a note or put it to trash.
     *
     * @param {Object} options
     * @param {Object} (options.model) - Backbone.model
     * @param {Object} (options.id) - ID of a model
     * @fires collections/Notes#destroy:model
     * @returns {Promise}
     */
    remove(options) {
        return this.findOrFetch(options)
        .then(model => {
            // If the model is already in trash, remove it
            if (Number(model.get('trash')) === 1) {
                return super.remove(options);
            }

            // Otherwise, just change its 'trash' attribute to 1
            return this.saveModel({model, data: {trash: 1}})
            .then(() => this.channel.trigger('destroy:model', {model}));
        });
    }

    /**
     * If model isn't in options, fetch it from the database.
     *
     * @param {Object} options
     * @param {Object} (options.model)
     * @param {String} (options.id)
     * @returns {Promise}
     */
    findOrFetch(options) {
        if (options.model) {
            return Promise.resolve(options.model);
        }

        // If the model wasn't provided, fetch it
        return this.findModel(options);
    }

    /**
     * Restore a model from trash.
     *
     * @param {Object} options
     * @param {Object} (options.model) - note model
     * @param {String} (options.id) - id of a note
     * @returns {Promise}
     */
    restore(options) {
        return this.findOrFetch(options)
        .then(model => {
            return this.saveModel({model, data: {trash: 0}})
            .then(() => this.channel.trigger('restore:model', {model}));
        });
    }

    /**
     * Change notebookId of notes attached to a notebook or move them to trash.
     *
     * @param {Object} options
     * @param {Object} options.model - notebook model
     * @param {Boolean} (options.removeNotes) - true if attached notes should be
     * moved to trash
     * @returns {Promise}
     */
    changeNotebookId(options) {
        const {model} = options;
        const data    = {notebookId: 0};

        // Change trash status
        if (options.removeNotes) {
            data.trash = 1;
        }

        return this.find({
            profileId  : model.profileId,
            conditions : {notebookId: model.id},
        })
        .then(notes => notes.fullCollection || notes)
        .then(collection => this.save({collection, data}));
    }

    /**
     * Find notes. Override the parent method to filter the collection
     * immediately after fetching.
     *
     * @param {Object} options
     * @returns {Promise}
     */
    find(options) {
        const sortField = Radio.channel('collections/Configs').request(
            'findConfig', {name: 'sortnotes'}
        );
        const opt = _.extend({sortField}, options);

        return super.find(opt);
    }

    /**
     * Find a note model by its ID.
     *
     * @param {Object} options
     * @param {Object} options.id
     * @param {Object} options.profileId
     * @param {Boolean} (options.findAttachments) - true if attached notebooks
     * and files should be fetched too
     * @returns {Promise}
     */
    findModel(options) {
        return super.findModel(options)
        .then(model => {
            if (options.findAttachments) {
                return this.findAttachments({model});
            }

            return model;
        });
    }

    /**
     * Find a model's attachments (notebooks, files).
     * Create two properties:
     * 1. model.notebook - a notebook model
     * 2. model.fileModels - all file models attached to the note
     *
     * @todo render markdown content
     * @param {Object} options
     * @param {Object} options.model
     * @returns {Promise} - resolves with the model
     */
    findAttachments(options) {
        const {model}  = options;
        const promises = [];

        // Fetch the notebook
        if (model.get('notebookId') !== '0') {
            promises.push(this.findNotebook(model));
        }

        // Fetch files
        if (!_.isEmpty(model.get('files'))) {
            promises.push(this.findFiles(model));
        }

        return Promise.all(promises)
        .then(() => Radio.request('components/markdown', 'render', model.attributes))
        .then(content => model.htmlContent = content)
        .then(() => model);
    }

    /**
     * Find a notebook attached to a note model.
     *
     * @param {Object} model
     * @returns {Promise}
     */
    findNotebook(model) {
        return Radio.request('collections/Notebooks', 'findModel', {
            profileId : model.profileId,
            id        : model.get('notebookId'),
        })
        .then(notebook => model.set('notebook', notebook));
    }

    /**
     * Find file models attached to a note model.
     *
     * @param {Object} model
     * @returns {Promise}
     */
    findFiles(model) {
        return Radio.request('collections/Files', 'findFiles', {
            profileId : model.profileId,
            ids       : model.get('files'),
        })
        .then(files => model.set('fileModels', files));
    }

}
