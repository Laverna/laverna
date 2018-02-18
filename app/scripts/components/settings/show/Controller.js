/**
 * @module components/settings/show/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';

import View from './View';
import General from './general/View';
import Editor from './editor/View';
import Encryption from './encryption/View';
import Keybindings from './keybindings/View';
import Sync from './sync/View';
import ImportExport from './importExport/View';

const log = deb('lav:components/settings/show/Controller');

/**
 * Settings content controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Tab view classes.
     *
     * @prop {Object}
     */
    get views() {
        return {
            General,
            Editor,
            Encryption,
            Keybindings,
            Sync,
            ImportExport,
        };
    }

    /**
     * Radio channel.
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('components/settings');
    }

    /**
     * Radio channel for configs collection.
     *
     * @prop {Object}
     */
    get configsChannel() {
        return Radio.channel('collections/Configs');
    }

    constructor(...args) {
        super(...args);

        /**
         * Used for saving new values for configs to save them later.
         *
         * @prop {Object}
         */
        this.changes = {};
    }

    onDestroy() {
        this.stopListening();
        this.channel.stopReplying();

        if (!this.view._isDestroyed) {
            this.view.destroy();
        }
    }

    /**
     * Init.
     *
     * @returns {Promise}
     */
    init() {
        this.options.tab = this.options.tab || 'general';

        return this.fetch()
        .then(res  => this.show(res))
        .then(()   => this.listenToEvents())
        .catch(err => log('error', err));
    }

    /**
     * Fetch configs.
     *
     * @returns {Promise}
     */
    fetch() {
        return Promise.all([
            this.configsChannel.request('find'),
            Radio.request('collections/Users', 'find'),
        ]);
    }

    /**
     * Show the layout view.
     *
     * @param {Array}
     */
    show(results) {
        const [collection, users] = results;
        const TabView = this.views[_.capitalize(this.options.tab)];

        // Render the view
        this.view = new View(_.extend(
            {collection, users, TabView},
            this.options
        ));
        Radio.request('Layout', 'show', {region: 'content', view: this.view});

        // Activate a tab in the sidebar
        this.channel.trigger('activate:tab', this.options);
    }

    /**
     * Start listening to events and requests.
     */
    listenToEvents() {
        // Listen to view events
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'save', this.save);
        this.listenTo(this.view, 'cancel', this.confirmNavigate);

        // Listen to child view events
        this.listenTo(this.view.tabView, 'change:value', this.changeValue);

        // Reply to requests
        this.channel.reply({
            confirmNavigate: this.confirmNavigate,
        }, this);
    }

    /**
     * Save new values of a config in "changes" property.
     *
     * @param {Object} data
     * @param {String} data.name
     * @param {String} data.value
     */
    changeValue(data) {
        this.changes[data.name] = data;
        log('new changes', this.changes);
    }

    /**
     * Save changes.
     *
     * @returns {Promise}
     */
    save() {
        if (!this.hasChanges()) {
            return Promise.resolve(this.view.triggerMethod('saved'));
        }

        return this.configsChannel.request('saveConfigs', {
            configs    : this.changes,
        })
        .then(() => this.view.triggerMethod('saved'))
        .then(() => this.changes = [])
        .catch(err => log('save error', err));
    }

    /**
     * Before navigating to another page, show a confirm message
     * if there are unsaved changes.
     *
     * @returns {Promise}
     */
    async confirmNavigate(...args) {
        // Don't show the confirmation dialog if there are no changes
        if (!this.hasChanges()) {
            return this.navigate(...args);
        }

        const res = await Radio.request('components/confirm', 'show', {
            content: _.i18n('You have unsaved changes'),
        });

        if (res === 'confirm') {
            return this.navigate(...args);
        }
    }

    /**
     * Check if there are any unsaved changes.
     *
     * @returns {Boolean} - returns true if there are some changes
     */
    hasChanges() {
        return !_.isEmpty(this.changes);
    }

    /**
     * Navigate to a page.
     *
     * @param {Object} options={}
     * @param {String} options.url
     */
    navigate(options = {}) {
        const url = options.url || '/notes';
        Radio.request('utils/Url', 'navigate', {url});

        // Reload the page to apply changes
        if (url.search('settings') === -1) {
            document.location.reload();
        }
    }

}
