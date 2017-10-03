/**
 * @module components/dropbox/Sync
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import deb from 'debug';
import Adapter from './Adapter';

const log = deb('lav:components/dropbox/Sync');

/**
 * Dropbox sync.
 *
 * @class
 * @license MPL-2.0
 */
export default class Sync {

    /**
     * Radio channel.
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('components/sync');
    }

    /**
     * App settings.
     *
     * @prop {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    /**
     * Names of the collections which should be synchronized.
     *
     * @prop {Array}
     */
    get collectionNames() {
        return ['Notes', 'Notebooks', 'Tags', 'Files'];
    }

    constructor() {
        /**
         * Sync adapter instance (Dropbox)
         *
         * @prop {Object}
         */
        this.adapter = new Adapter(this.configs);

        /**
         * Sync stats.
         *
         * @prop {Object}
         */
        this.stat = {
            interval    : 2000,
            intervalMax : 15000,
            intervalMin : 2000,
        };

        // Reply to requests
        this.channel.reply({
            start: this.start,
        }, this);
    }

    /**
     * Initialize synchronization.
     *
     * @returns {Promise}
     */
    init() {
        return this.adapter.checkAuth()
        .then(authenticated => {
            if (authenticated) {
                return this.start();
            }

            log('Authentication failed');
        })
        .catch(err => log('error', err));
    }

    /**
     * Start synchronizing.
     */
    start() {
        this.stopWatch();
        this.timeout = setTimeout(() => this.sync(), 500);
    }

    /**
     * Schedule a new check.
     */
    startWatch() {
        this.stopWatch();
        this.timeout = window.setTimeout(() => this.sync(), this.getInterval());
    }

    /**
     * Compute the wait time for the watchdog.
     *
     * @returns {Number}
     */
    getInterval() {
        const range = this.stat.intervalMax - this.stat.intervalMin;

        if (this.stat.statRemote) {
            this.stat.interval -= (range * 0.4);
        }
        else {
            this.stat.interval += (range * 0.2);
        }

        this.stat.interval = Math.max(this.stat.intervalMin, this.stat.interval);
        this.stat.interval = Math.min(this.stat.intervalMax, this.stat.interval);
        log(`next check is after ${this.stat.interval}ms`);
        return this.stat.interval;
    }

    /**
     * Stop a check.
     */
    stopWatch() {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
        }
    }

    /**
     * Synchronize all collections.
     *
     * @returns {Promise}
     */
    sync() {
        let promise = Promise.resolve();
        this.channel.trigger('start');
        this.stat.statRemote = false;
        log('checking for changes...');

        _.each(this.collectionNames, name => {
            promise = promise.then(() => this.syncCollection(name));
        });

        return promise
        .then(() => {
            this.channel.trigger('stop', {result: 'success'});
            this.startWatch();
        })
        .catch(error => {
            log('sync error', error);
            this.channel.trigger('stop', {result: 'error', error});
        });
    }

    /**
     * Synchronize a collection.
     *
     * @param {String} name - Notes, Notebooks, Files, Tags...
     * @returns {Promise}
     */
    syncCollection(name) {
        return Radio.request(`collections/${name}`, 'find')
        .then(collection => {
            return this.adapter.find({type: collection.storeName})
            .then(files => {
                return {files, collection: collection.fullCollection || collection};
            });
        })
        .then(data => {
            return this.syncRemoteChanges(data)
            .then(() => this.syncLocalChanges(data));
        });
    }

    /**
     * Save remote changes locally.
     *
     * @param {Array} files
     * @param {Object} collection - Backbone model
     * @returns {Promise}
     */
    syncRemoteChanges({files, collection}) {
        const promises = [];

        _.each(files, file => {
            const model = collection.findWhere({id: file.id});

            if (!model || model.get('updated') < file.updated) {
                this.stat.statRemote = true;
                promises.push(collection.channel.request('saveModelObject', {
                    data      : file,
                    profileId : collection.profileId,
                }));
            }
        });

        return Promise.all(promises);
    }

    /**
     * Synchronize local changes with a cloud storage.
     *
     * @param {Array} files
     * @param {Object} collection - Backbone model
     * @returns {Promise}
     */
    syncLocalChanges({files, collection}) {
        const promises = [];

        collection.each(model => {
            const file = _.findWhere(files, {id: model.id});

            if (!file || file.updated < model.get('updated')) {
                promises.push(this.adapter.saveModel({model}));
            }
        });

        return Promise.all(promises);
    }

}
