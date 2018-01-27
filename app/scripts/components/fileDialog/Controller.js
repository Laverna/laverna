/**
 * @module components/fileDialog/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import View from './View';
import deb from 'debug';

const log = deb('lav:components/fileDialog/Controller');

/**
 * File dialog controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    onDestroy() {
        log('destroyed');

        if (this.promise) {
            this.promise.resolve(null);
            this.promise = null;
        }
    }

    /**
     * Initialize the dialog view.
     *
     * @returns {Promise}
     */
    init() {
        return new Promise((resolve, reject) => {
            this.promise = {resolve, reject};
            this.show();
            this.listenToEvents();
        });
    }

    /**
     * Render the view.
     */
    show() {
        this.view = new View({});
        Radio.request('Layout', 'show', {region: 'modal', view: this.view});
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'save', this.onSave);
        this.listenTo(this.view, 'cancel', () => this.view.destroy());
    }

    /**
     * Resolve the promise.
     *
     * @param {String} text
     */
    resolve(text) {
        this.promise.resolve(text);
        this.promise = null;
        this.view.destroy();
    }

    /**
     * Resolve the promise with a link.
     *
     * @param {Object} options={}
     * @param {Boolean} [options.isFile]
     */
    onSave(options = {}) {
        const url = this.view.ui.url.val().trim();

        // A user provided a URL
        if (url.length) {
            this.resolve(this.makeText(url, options.isFile));
        }
        else if (this.view.files.length) {
            this.saveFiles();
        }
        // Destroy the view if nothing was provided
        else {
            this.view.destroy();
        }
    }

    /**
     * Make a Markdown/HTML text with the link/image/
     *
     * @param {String} url
     * @param {Boolean} isFile
     * @returns {String}
     */
    makeText(url, isFile) {
        const data = {url, text: 'Alt description'};

        // If it is a file, generate a link
        if (isFile) {
            return Radio.request('components/editor', 'makeLink', data);
        }

        // Otherwise, generate an image code
        return Radio.request('components/editor', 'makeImage', data);
    }

    /**
     * Save all files.
     *
     * @returns {Promise}
     */
    saveFiles() {
        return Radio.request('collections/Files', 'addFiles', {
            files: this.view.files,
        })
        .then(files => {
            let {fileModels} = this.options.model.attributes;
            fileModels       = _.union(fileModels, files);
            this.options.model.set('fileModels', fileModels);
            this.attachFiles(files);
        })
        .catch(err => log('error', err));
    }

    /**
     * Attach several files.
     *
     * @param {Array} files
     * @returns {String}
     */
    attachFiles(files) {
        let str = '';

        _.each(files, model => {
            const url     = Radio.request('utils/Url', 'getFileLink', {model});
            const isImage = model.get('fileType').indexOf('image') > -1;
            str += `${this.makeText(url, !isImage)}\n`;
        });

        this.resolve(str);
        return str;
    }

}
