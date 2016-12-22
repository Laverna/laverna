/**
 * @module components/notes/show/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';

import View from './View';

const log = deb('lav:components/notes/show/Controller');

/**
 * The controller shows an individual note.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Application configs.
     *
     * @returns {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    /**
     * Fetch the note and render the view.
     *
     * @returns {Promise}
     */
    init() {
        log('options', this.options);

        Radio.request('Layout', 'showLoader', {region: 'content'});

        return this.fetch()
        .then(model => this.show(model))
        .then(() => this.listenToEvents())
        .catch(err => log('error', err));
    }

    onDestroy() {
        log('destroyed notes/show controller');
    }

    /**
     * Fetch the note model.
     *
     * @returns {Promise}
     */
    fetch() {
        return Radio.request('collections/Notes', 'findModel', _.extend({
            findAttachments: true,
        }, this.options));
    }

    /**
     * Render the view.
     *
     * @param {Object} model
     */
    show(model) {
        this.view = new View({
            model,
            configs     : this.configs,
            filterArgs  : this.options,
            profileLink : Radio.request('utils/Url', 'getProfileLink', this.options),
        });

        // Render the view in "content" region
        Radio.request('Layout', 'show', {
            region : 'content',
            view   : this.view,
        });

        // Set document title
        Radio.request('utils/Title', 'set', {title: model.get('title')});
        Radio.trigger('components/notes', 'model:active', {model});
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'destroy', this.destroy);

        // Notes channel events
        const channel = Radio.channel('collections/Notes');
        this.listenTo(channel, 'destroy:model', this.onModelDestroy);
        this.listenTo(channel, `save:object:${this.options.id}`, this.onSaveObject);

        this.listenTo(this.view, 'toggle:task', this.toggleTask);
        this.listenTo(this.view, 'restore:model', this.restoreModel);
    }

    /**
     * Destroy itself if the model is removed.
     *
     * @param {Object} data
     * @param {Object} data.model - Backbone model
     */
    onModelDestroy(data) {
        if (this.view.model.id === data.model.id) {
            this.destroy();
        }
    }

    /**
     * After a model is synchronized, refresh the model again.
     *
     * @fires model#synced
     * @returns {Promise}
     */
    onSaveObject() {
        return this.fetch()
        .then(model => {
            this.view.model.htmlContent = model.htmlContent;
            this.view.model.set(model.attributes);
            this.view.model.trigger('synced');
        })
        .catch(err => log('error', err));
    }

    /**
     * Toggle a task's status in content.
     *
     * @param {Object} data - Promise
     * @param {String} data.taskId
     */
    toggleTask(data) {
        const {model}  = this.view;
        const {taskId} = data;

        return Radio.request('components/markdown', 'toggleTask', {
            taskId,
            content: model.get('content'),
        })
        .then((data = {}) => {
            model.htmlContent = data.htmlContent;

            return Radio.request('collections/Notes', 'saveModel', {
                model,
                data: _.pick(data, 'content', 'taskCompleted', 'taskAll'),
            });
        })
        .catch(err => log('toggleTask() error:', err));
    }

    /**
     * Restore a model from trash.
     *
     * @returns {Promise}
     */
    restoreModel() {
        return Radio.request('collections/Notes', 'restore', {
            model: this.view.model,
        });
    }

}
