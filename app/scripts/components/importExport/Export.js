/**
 * @module components/importExport/Export
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import JSZip from 'jszip';
import deb from 'debug';

import fileSaver from '../../utils/fileSaver';

const log = deb('lav:components/importExport/Export');

/**
 * Export data from Laverna to a ZIP archive.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Export extends Mn.Object {

    /**
     * An array of profile names.
     *
     * @prop {Array}
     */
    get profiles() {
        return Radio.request('collections/Configs', 'findConfig', {name: 'appProfiles'});
    }

    /**
     * The names of collections that need to be exported.
     *
     * @prop {Array}
     */
    get collections() {
        return ['Notes', 'Notebooks', 'Tags', 'Configs', 'Files', 'Users'];
    }

    onDestroy() {
        this.zip = null;
    }

    init() {
        this.zip = new JSZip();

        // If data is provided, start exporting them without fetching anything
        if (this.options.data) {
            return this.exportData();
        }

        // Otherwise, fetch data from database and then start exporting them
        return this.export();
    }

    /**
     * Collections were already fetched. Start exporting them.
     *
     * @returns {Promise}
     */
    exportData() {
        const {data} = this.options;

        // There is no data to export
        if (!_.keys(data).length) {
            return Promise.resolve();
        }

        /* Data structure should be similar to this:
         * {default: [Notes, Notebooks, Tags], profile2: []},
         */
        _.each(data, collections => this.exportCollections(collections));

        return this.saveToFile()
        .catch(err => log('error', err));
    }

    /**
     * Fetch collections from each profile and start exporting them.
     *
     * @returns {Promise}
     */
    export() {
        const promises = [];

        _.each(this.profiles, profileId => {
            promises.push(this.exportProfile(profileId));
        });

        return Promise.all(promises)
        .then(() => this.saveToFile())
        .catch(err => log('error', err));
    }

    /**
     * Fetch collections from a profile and export them.
     *
     * @param {String} profileId
     * @returns {Promise}
     */
    exportProfile(profileId) {
        const promises = [];

        _.each(this.collections, type => {
            promises.push(
                Radio.request(`collections/${type}`, 'find', {profileId})
            );
        });

        log(`export profile ${profileId}`);
        return Promise.all(promises)
        .then(collections => this.exportCollections(collections));
    }

    /**
     * Export data from collections.
     *
     * @param {Array} collections - an array of collections
     */
    exportCollections(collections) {
        _.each(collections, collection => this.exportCollection(collection));
    }

    /**
     * Export data from a collection.
     *
     * @param {Object} collection - Backbone collection
     */
    exportCollection(collection) {
        const path = `laverna-backups/${collection.profileId}`;
        const coll = collection.fullCollection || collection;

        // Every model in a notes collection is saved in separate files
        if (collection.storeName === 'notes') {
            coll.each(model => this.exportNote(path, model));
        }
        else if (collection.storeName === 'files') {
            coll.each(model => this.exportFile(path, model));
        }
        // Other collections' data is saved in one JSON file
        else {
            this.exportToJSON(path, collection);
        }
        log(`exporting ${coll.storeName}`);
    }

    /**
     * Export a collection to a JSON file.
     *
     * @param {String} path
     * @param {Object} collection
     */
    exportToJSON(path, collection) {
        const data = JSON.stringify(
            collection.getExportData ? collection.getExportData() : collection.toJSON()
        );
        this.zip.file(`${path}/${collection.storeName}.json`, data);
    }

    /**
     * Export a note model to the ZIP archive.
     *
     * @param {String} path - the path where the note file should be saved
     * @param {Object} model
     */
    exportNote(path, model) {
        const fileName = `${path}/notes/${model.id}`;
        const data     = JSON.stringify(_.omit(model.getData(), 'content'));

        this.zip.file(`${fileName}.md`, model.get('content'));
        this.zip.file(`${fileName}.json`, data);
    }

    /**
     * Export a file attachment.
     *
     * @param {String} path - the path where the file should be saved
     * @param {Object} model
     */
    exportFile(path, model) {
        this.zip.file(
            `${path}/files/${model.id}.json`,
            JSON.stringify(model.getData())
        );
    }

    /**
     * Save ZIP archive to a file.
     *
     * @returns {Promise}
     */
    saveToFile() {
        return this.zip.generateAsync({type: 'blob'})
        .then(blob => this.saveAs(blob, 'laverna-backup.zip'))
        .then(() => this.destroy());
    }

    saveAs(...args) {
        return fileSaver(...args);
    }

}
