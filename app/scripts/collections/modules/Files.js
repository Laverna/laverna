/**
 * @module collections/modules/Files
 */
import _ from 'underscore';
import toBlob from 'blueimp-canvas-to-blob';
import Module from './Module';
import Collection from '../Files';

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
            findFiles : this.findFiles,
            addFiles : this.addFiles,
        }, this);
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
     * Save a file model. It overrides the parent method
     * to convert "src" property to blob.
     *
     * @param {Object} options
     * @param {Object} options.model - a file model
     * @param {Object} (options.data)
     * @returns {Promise}
     */
    saveModel(options) {
        const data = options.data || options.model.attributes;
        data.src   = toBlob(data.src);

        return super.saveModel(_.extend(options, {data}));
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
        const models  = [];
        const promise = Promise.resolve();

        _.each(files, data => {
            const model = new this.Model(null, {profileId});

            promise.then(() => {
                return this.saveModel({model, data})
                .then(() => models.push(model));
            });
        });

        return promise.then(() => models);
    }

}
