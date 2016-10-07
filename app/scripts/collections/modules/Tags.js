/**
 * @module collections/modules/Tags
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import Module from './Module';
import Collection from '../Tags';

/**
 * Tag collection module
 *
 * @class
 * @extends module:collections/modules/Module
 * @license MPL-2.0
 */
export default class Tags extends Module {

    /**
     * Tag collection.
     *
     * @see module:collections/Tags
     * @returns {Object}
     */
    get Collection() {
        return Collection;
    }

    constructor() {
        super();

        // Add new replies
        this.channel.reply({
            addTags: this.addTags,
        }, this);
    }

    /**
     * Add several tags.
     *
     * @param {Object} options
     * @param {String} options.profileId
     * @param {Array} options.tags
     * @returns {Promise}
     */
    addTags(options) {
        const promise = Promise.resolve();

        _.each(options.tags, name => {
            promise.then(() => this.addTag(_.extend({name}, options)));
        });

        return promise;
    }

    /**
     * Add a new tag if it does not exist.
     *
     * @param {Object} options
     * @param {String} options.name - name of the tag
     * @param {String} options.profileId
     * @returns {Promise}
     */
    addTag(options) {
        const opt = options;

        return Radio.request('encrypt', 'sha256', {text: opt.name})
        .then(id => {
            opt.id = id.join('');
            return this.findModel(opt);
        })
        .then(resModel => {
            // A model with the same name and ID already exists
            if (resModel && resModel.get('name').length) {
                return resModel;
            }

            // Create a new model
            const model = new this.Model();
            model.setEscape(opt);
            return this.saveModel({model});
        });
    }

    /**
     * Save a tag model.
     *
     * @param {Object} options
     * @param {Object} options.model
     * @returns {Promise}
     */
    saveModel(options) {
        const {model} = options;

        return Radio.request('encrypt', 'sha256', {text: model.get('name')})
        .then(sha256 => {
            const id = sha256.join('');

            // If it is a new model or it has the same ID, do nothing
            if (!model.id || model.id === id) {
                return id;
            }

            // Otherwise, remove the previous model
            return this.remove({model})
            .then(() => id);
        })
        .then(id => {
            model.set('id', id);
            return super.saveModel(options);
        });
    }

}
