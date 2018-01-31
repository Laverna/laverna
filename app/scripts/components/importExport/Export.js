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
     * Current user's profile model data.
     *
     * @prop {Object}
     */
    get user() {
        return Radio.request('collections/Profiles', 'getUser').attributes;
    }

    /**
     * ProfileId.
     *
     * @prop {String}
     */
    get profileId() {
        return this.user.username;
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
        else if (this.options.exportKey) {
            return this.exportKey();
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
        if (data.length) {
            return Promise.resolve();
        }

        /* Data structure should be similar to this:
         * [Notes, Notebooks, Tags]
         */
        return this.exportCollections(data)
        .then(() => this.saveToFile())
        .catch(err => log('error', err));
    }

    /**
     * Export the OpenPGP private key
     */
    exportKey() {
        const blob = new Blob(
            [this.user.privateKey],
            {type: 'text/plain;charset=ascii'}
        );

        this.saveAs(blob, `laverna-key-${this.user.username}.asc`);
        this.destroy();
    }

    /**
     * Fetch collections from a profile and export them.
     *
     * @returns {Promise}
     */
    export() {
        const promises = [];

        // Export profile data
        this.exportProfile();

        _.each(this.collections, type => {
            promises.push(this.fetchExportCollection(type));
        });

        return Promise.all(promises)
        .then(()   => this.saveToFile())
        .catch(err => log('error', err));
    }

    /**
     * Fetch a collection and export it.
     *
     * @param {String} type - collection name [notes|notebooks|...]
     * @returns {Promise}
     */
    fetchExportCollection(type) {
        const profileId = this.profileId;

        return Radio.request(`collections/${type}`, 'find', {profileId})
        .then(collection => this.exportCollection(collection));
    }

    /**
     * Export the user's profile data.
     */
    exportProfile() {
        const user = JSON.stringify([this.user]);
        this.zip.file('laverna-backups/profiles.json', user);
    }

    /**
     * Export data from collections.
     *
     * @param {Array} collections - an array of collections
     */
    exportCollections(collections) {
        _.each(collections, collection => this.exportCollection(collection));
        this.exportProfile();
    }

    /**
     * Export data from a collection.
     *
     * @param {Object} collection - Backbone collection
     */
    exportCollection(collection) { // eslint-disable-line
        const profileId = collection.profileId || this.profileId;
        const path = `laverna-backups/${profileId}`;
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
        let data       = model.getData();

        // Create a Markdown file with note's content only if encryption is disabled
        if (data.content) {
            this.zip.file(`${fileName}.md`, data.content);
        }

        data = JSON.stringify(_.omit(data, 'content'));
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
        .then(blob => this.saveAs(blob, `laverna-backup-${this.user.username}.zip`))
        .then(() => this.destroy());
    }

    saveAs(...args) {
        return fileSaver(...args);
    }

}
