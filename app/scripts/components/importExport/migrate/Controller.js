/**
 * @module components/importExport/migrate/Controller
 */
import _ from 'underscore';
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import deb from 'debug';
import localforage from 'localforage';

import Encryption from './Encryption';
import View from './View';

const log = deb('lav:components/importExport/migrate/Controller');

/**
 * Migrates data from the old version of Laverna to the new.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * @returns {Promise}
     */
    init() {
        return new Promise((resolve, reject) => {
            this.promise = {resolve, reject};
            this.check();
        });
    }

    /**
     * Check if migration is needed.
     *
     * @returns {Promise}
     */
    check() {
        return this.requiresMigration()
        .then(requiresMigration => {
            if (!requiresMigration) {
                this.promise.resolve();
                return this.destroy();
            }

            log('started migration');
            return this.findOldData('configs')
            .then(configs => this.show(configs));
        });
    }

    /**
     * Check if it requires migration.
     *
     * @returns {Promise} - resolves with boolean
     */
    requiresMigration() {
        return Promise.all([
            Radio.request('collections/Notes', 'find', {}),
            this.findOldData(),
        ])
        .then(([collection, oldData]) => {
            return (collection.length === 0 && oldData.length !== 0);
        });
    }

    /**
     * Fetch old data from notes-db database.
     *
     * @param {String} storeName - [notes|notebooks|files|tags|configs]
     * @returns {Promise}
     */
    findOldData(storeName = 'notes') {
        const models = [];

        return localforage.createInstance({storeName, name: 'notes-db'})
        .iterate(value => {
            if (value) {
                models.push(value);
            }
        })
        .then(() => models);
    }

    /**
     * Check authentication.
     *
     * @param {Object} configs
     * @returns {Promise}
     */
    show(configs) {
        this.configs = {};
        _.each(configs, conf => this.configs[conf.name] = conf.value);
        this.configs.encrypt = Number(this.configs.encrypt);

        this.view = new View({configs: this.configs});
        Radio.request('Layout', 'show', {region: 'brand', view: this.view});

        this.listenTo(this.view, 'cancel', this.cancelMigration);
        this.listenTo(this.view, 'start', this.startMigration);
    }

    /**
     * Start migration process.
     *
     * @returns {Promise}
     */
    startMigration() {
        let promise  = Promise.resolve(true);
        this.encrypt = new Encryption({configs: this.configs});

        if (this.configs.encrypt) {
            promise = promise.then(() => {
                return this.encrypt.auth({password: this.view.ui.password.val()});
            });
        }

        return promise.then(res => {
            if (!res) {
                return this.view.triggerMethod('auth:failure');
            }

            return this.migrateCollections();
        })
        .catch(error => {
            log('error', error);
            this.view.triggerMethod('migrate:failure', {error});
        });
    }

    /**
     * Cancel migration.
     */
    cancelMigration() {
        this.promise.resolve();
        this.destroy();
    }

    /**
     * Migrate data from old database.
     *
     * @returns {Promise}
     */
    migrateCollections() {
        this.view.triggerMethod('migrate:start');

        return Promise.all([
            this.findOldData('notes'),
            this.findOldData('notebooks'),
            this.findOldData('tags'),
            this.findOldData('files'),
        ])
        .then(collections => {
            let promise = Promise.resolve();

            _.each(collections, (data, i) => {
                this.view.triggerMethod('migrate:collection', {
                    percent : ((i + 1) / collections.length) * 100,
                    type    : data.length ? data[0].type : '',
                });

                promise = promise.then(() => this.migrateCollection(data));
            });

            return promise;
        })
        .then(() => {
            this.promise.resolve();
            this.destroy();
        });
    }

    /**
     * Migrate data to a single collection.
     *
     * @param {Array} data
     * @returns {Promise}
     */
    migrateCollection(data) {
        const promises = [];

        _.each(data, attributes => {
            promises.push(this.migrateModel({attributes}));
        });

        return Promise.all(promises);
    }

    /**
     * Migrate a model from the previous database.
     *
     * @param {Object} {attributes} - model's attributes
     * @returns {Promise}
     */
    migrateModel({attributes}) {
        const name = `collections/${_.capitalize(attributes.type)}`;
        const data = _.omit(this.encrypt.decryptModel({attributes}), 'encryptedData');

        return Radio.request(name, 'saveModelObject', {data});
    }

}
