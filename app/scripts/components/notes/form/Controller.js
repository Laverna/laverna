/**
 * @module components/notes/form/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import deb from 'debug';

import View from './views/Form';

const log = deb('lav:components/notes/form/Controller');

/**
 * Notes form controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    get notesChannel() {
        return Radio.channel('collections/Notes');
    }

    /**
     * Ignore these values when checking if a note's changed.
     *
     * @prop {Array}
     */
    get ignoreKeys() {
        return ['created', 'updated', 'encryptedData'];
    }

    /**
     * Fetch data and show the form.
     *
     * @returns {Promise}
     */
    init() {
        return this.fetch()
        .then(results => {
            this.model     = results[0];
            this.notebooks = results[1];
        })
        .then(() => this.show())
        .then(() => this.listenToEvents())
        .catch(err => log('error', err));
    }

    onDestroy() {
        log('destroyed');
    }

    /**
     * Fetch the note and notebooks.
     *
     * @returns {Promise}
     */
    fetch() {
        const {profileId} = this.options;
        return Promise.all([
            this.notesChannel.request('findModel', _.extend({
                findAttachments: !_.isNull(this.options.id),
            }, this.options)),
            Radio.request('collections/Notebooks', 'find', {profileId}),
        ]);
    }

    /**
     * Show the view.
     */
    show() {
        // Saves data before you change anything, in case you cancel editing
        this.dataBeforeChange = _.omit(this.model.attributes, this.ignoreKeys);

        // Instantiate the view
        this.view = new View({
            model       : this.model,
            notebooks   : this.notebooks,
            notebookId  : this.getNotebookId(),
            filtersArgs : this.options,
            configs     : this.configs,
        });

        // Render the view
        Radio.request('Layout', 'show', {
            region : 'content',
            view   : this.view,
        });
        this.view.triggerMethod('after:render');

        // Set document title
        Radio.request('utils/Title', 'set', {title: this.model.get('title')});
    }

    /**
     * Return notebook ID to which the note should be attached to.
     *
     * @returns {String} notebook Id
     */
    getNotebookId() {
        let notebookId = this.model.get('notebookId');

        /*
         * If the current note doesn't have a notebook attached,
         * try to use one from the filter if it specifies a notebook.
         */
        if (notebookId === '0' && this.options.filter === 'notebook') {
            notebookId = this.options.query;
        }

        return notebookId;
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'save', this.save);
        this.listenTo(this.view, 'cancel', this.checkChanges);

        this.listenTo(this.notesChannel, `save:object:${this.options.id}`,
            this.onSaveObject);
    }

    /**
     * Save the model.
     *
     * @param {Object} options
     * @param {Object} (options.autoSave) - true if "save" event is
     * triggered from autoSave method
     * @returns {Promise}
     */
    save(options = {}) {
        return this.getData()
        .then(data => this.checkTitle(data))
        .then(data => {
            return this.notesChannel.request('saveModel', {
                data,
                saveTags : options.autoSave !== true,
                model    : this.view.model,
            });
        })
        .then(() => {
            Radio.trigger('components/notes', 'save:model', {model: this.view.model});

            // Redirect to the previous page if isn't auto save
            if (options.autoSave !== true) {
                return this.redirect(false);
            }
        })
        .catch(err => log('error', err));
    }

    /**
     * Return updated data.
     *
     * @returns {Promise} resolves with an object
     */
    getData() {
        const notebookId = this.view.getChildView('notebooks').ui
        .notebookId.val().trim();

        return Radio.request('components/editor', 'getData')
        .then(data => {
            return _.extend({}, data, {
                notebookId,
                title: this.view.ui.title.val().trim(),
            });
        });
    }

    /**
     * Check if data contains title. If it doesnt, use "Untitled" as a title.
     *
     * @param {Object} data
     * @returns {Object}
     */
    checkTitle(data) {
        if (data.title === '') {
            data.title = _.i18n('Untitled'); // eslint-disable-line
        }

        // Set a new document title
        Radio.request('utils/Title', 'set', {title: data.title});
        return data;
    }

    /**
     * Check if there are any new changes. If there are, ask the user if
     * they want to cancel those changes.
     *
     * @returns {Promise}
     */
    checkChanges() {
        return this.getData()
        .then(res => {
            this.model.setEscape(res);
            const data = _.omit(this.model.attributes, this.ignoreKeys);

            // There aren't any changes
            if (_.isEqual(this.dataBeforeChange, data)) {
                return this.redirect(false);
            }

            return this.showCancelConfirm();
        })
        .catch(err => log('error', err));
    }

    /**
     * After a model is synchronized, refresh the model again.
     *
     * @fires model#synced
     * @returns {Promise}
     */
    onSaveObject() {
        return this.fetch()
        .then(([model]) => {
            this.view.model.htmlContent = model.htmlContent;
            this.view.model.set(model.attributes);
            this.view.model.trigger('synced');
        })
        .catch(err => log('error', err));
    }

    /**
     * Show a confirmation dialog asking a user if it is alright to
     * lose all changes.
     *
     * @returns {Promise}
     */
    showCancelConfirm() {
        return Radio.request('components/confirm', 'show', {
            content: _.i18n('You have unsaved changes'),
        })
        .then(res => {
            if (res === 'confirm') {
                return this.redirect();
            }

            return this.onRejectCancel();
        })
        .catch(err => log('cancel confirm error', err));
    }

    /**
     * Redirect to the previous page.
     *
     * @param {Boolean} preRedirect = true - false if the note should not
     * be removed or restored to the original state before redirecting
     * @returns {Promise}
     */
    redirect(preRedirect = true) {
        return (preRedirect ? this.preRedirect() : Promise.resolve())
        .then(() => Radio.request('utils/Url', 'navigateBack'))
        .then(() => this.view.destroy());
    }

    /**
     * Delete the new note model or restore the original state
     * of the existing note.
     *
     * @returns {Promise}
     */
    preRedirect() {
        // Delete the new note model
        if (_.isUndefined(this.options.id)) {
            return Radio.request('components/notes', 'remove', {
                model : this.model,
                force : true,
            });
        }

        // Restore the original state of the note.
        return this.notesChannel.request('saveModel', {
            model : this.model,
            data  : this.dataBeforeChange,
        });
    }

    /**
     * User changed their minds about canceling all changes.
     */
    onRejectCancel() {
        // Enable auto save again
        this.view.options.isClosed = false;
        this.view.trigger('bind:keys');

        // Bring back the focus to the last active form element
        if (this.view.options.focus !== 'editor') {
            return this.view.ui[this.view.options.focus].focus();
        }

        Radio.trigger('components/editor', 'focus');
    }

}
