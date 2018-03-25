/**
 * @module components/encryption/encrypt/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import deb from 'debug';
import View from './View';

const log = deb('lav:components/encryption/encrypt/Controller');

/**
 * Decrypts or encrypts data after disabling or enabling encryption.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * App settings.
     *
     * @prop {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    /**
     * Collections which use encryption.
     *
     * @prop {Array}
     */
    get collectionNames() {
        return [
            'Notes',
            'Notebooks',
            'Tags',
            'Edits',
            'Shadows',
        ];
    }

    onDestroy() {
        log('destroy');
        if (this.promise) {
            this.view.destroy();
            this.promise.resolve();
        }
    }

    init() {
        // Do nothing if encryption backup is empty
        if (_.isEmpty(this.configs.encryptBackup)) {
            return Promise.resolve(this.destroy());
        }

        return new Promise((resolve, reject) => {
            this.promise = {resolve, reject};
            this.show();
            this.listenToEvents();
        });
    }

    /**
     * Show the view.
     */
    show() {
        this.view = new View({configs: this.configs});
        Radio.request('Layout', 'show', {
            region : 'brand',
            view   : this.view,
        });
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        log('listening to events');
        this.listenTo(this.view, 'proceed', this.proceed);
    }

    /**
     * Empty encryption backups.
     *
     * @returns {Promise}
     */
    resetBackup() {
        return Radio.request('collections/Configs', 'saveConfig', {
            config: {name: 'encryptBackup', value: {}},
        });
    }

    /**
     * Start encrypting/decrypting everything.
     *
     * @returns {Promise}
     */
    proceed() {
        log('proceed');

        let promise = Promise.resolve();
        this.view.showProgress();

        _.each(this.collectionNames, (name, i) => {
            promise = promise.then(() => {
                return Radio.request(`collections/${name}`, 'find', {perPage: 0});
            })
            .then(collection => this.saveCollection(collection, i + 1));
        });

        return promise
        .then(() => this.resetBackup())
        // Destroy the view after 350ms to show progress
        .then(() => {
            setTimeout(() => this.destroy(), 350);
        })
        .catch(err => {
            log('error', err);
            this.promise.reject(err);
        });
    }

    /**
     * Save a collection.
     *
     * @param {Object} collection
     * @param {Number} count
     * @returns {Promise}
     */
    saveCollection(collection, count) {
        const encrypt  = Number(this.configs.encrypt);
        const promises = [];

        collection.each(model => {
            // Prevent it from saving encryptedData if encryption is disabled
            if (!encrypt) {
                model.set('encryptedData', '');
            }

            promises.push(model.channel.request('saveModel', {model}));
        });

        return Promise.all(promises)
        .then(() => {
            this.view.changeProgress({count, max: this.collectionNames.length});
        });
    }

}
