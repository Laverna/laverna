/**
 * @module collections/modules/Files
 */
import _ from 'underscore';
import toBlob from 'blueimp-canvas-to-blob';
import Module from './Module';
import Collection from '../Files';
import md5 from 'js-md5';

/**
 * Files collection module.
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Files extends Module {

    /**
     * File collection.
     *
     * @see module:collections/Files
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    constructor() {
        super();

        this.channel.reply({
            findFiles  : this.findFiles,
            addFiles   : this.addFiles,
            createUrls : this.createUrls,
        }, this);
    }

    saveModel(options) {
        const {model, data} = options;

        // Use md5 sum of the file as an ID to avoid duplicates
        if (!model.get('id') && !data.id) {
            const src = data.src || model.get('src');
            const id  = md5.create().update(src).hex(); // eslint-disable-line
            model.set({id});
        }

        return super.saveModel(options);
    }

    /**
     * Find all files with the specified IDs.
     *
     * @param {Object} options
     * @param {Array} options.ids - an array of file IDs
     * @param {String} options.profileId
     * @returns {Promise}
     */
    findFiles(options) {
        const {ids, profileId} = options;
        const promises         = [];

        _.each(ids, id => {
            promises.push(this.findModel({profileId, id}));
        });

        return Promise.all(promises)
        .then((...args) => args[0]);
    }

    /**
     * Save several files.
     *
     * @param {Object} options
     * @param {Array} files - an array with objects
     * @param {String} profileId
     * @returns {Promise}
     */
    addFiles(options) {
        const {files, profileId} = options;
        const models   = [];
        const promises = [];

        _.each(files, data => {
            const model = new this.Model(null, {profileId});
            models.push(model);
            promises.push(this.saveModel({model, data}));
        });

        return Promise.all(promises).then(() => models);
    }

    /**
     * Create object URLs.
     *
     * @param {Array} models
     * @returns {Array}
     */
    createUrls({models}) {
        const url = (URL || window.webkitURL);

        return _.map(models, model => {
            const src = toBlob(model.get('src'));
            return {
                id  : model.id,
                url : url.createObjectURL(src),
            };
        });
    }

}
