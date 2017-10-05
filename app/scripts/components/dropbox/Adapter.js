/**
 * @module components/dropbox/Adapter
 */
import Dropbox from 'dropbox';
import _ from 'underscore';
import Radio from 'backbone.radio';
import Backbone from 'backbone';

/**
 * Dropbox sync adapter.
 *
 * @class
 * @license MPL-2.0
 */
export default class Adapter {

    /**
     * Default Dropbox app key.
     *
     * @prop {String}
     */
    get clientKey() {
        return '10iirspliqts95d';
    }

    /**
     * @param {Object} configs - app settings
     */
    constructor(configs) {
        const {dropboxKey} = configs;
        this.configs       = _.extend(
            {
                clientKey   : dropboxKey.length ? dropboxKey : this.clientKey,
                accessToken : configs.dropboxAccessToken,
            },
            configs
        );

        /**
         * Dropbox instance
         *
         * @prop {Object}
         */
        this.dbx = new Dropbox({clientId: this.configs.clientKey});
    }

    /**
     * Check authentication.
     *
     * @returns {Promise}
     */
    checkAuth() {
        const hash = this.parseHash();

        // The access token was saved in configs
        if (this.configs.accessToken && this.configs.accessToken.length) {
            this.dbx.setAccessToken(this.configs.accessToken);
            return Promise.resolve(true);
        }
        // A user has granted the permission
        else if (hash.access_token && hash.access_token.length) {
            return this.saveAccessToken(hash.access_token);
        }
        else {
            // Clear the location hash if there was an error with auth
            if (hash.error) {
                Radio.request('utils/Url', 'navigate', {url: '/'});
            }

            return this.authenticate();
        }
    }

    /**
     * Parse the location hash.
     *
     * @returns {Object}
     */
    parseHash() {
        const hash = Backbone.history.fragment.split('&');
        const ret  = {};

        if (!hash.length) {
            return ret;
        }

        _.each(hash, str => {
            const parts = str.replace(/\+/g, ' ').split('=');

            if (parts.length > 1) {
                const key   = parts.shift();
                let val     = parts.length > 0 ? parts.join('=') : undefined;
                val         = undefined ? null : decodeURIComponent(val.trim());
                ret[key] = val;
            }
        });

        return ret;
    }

    /**
     * Authenticate.
     *
     * @returns {Promise}
     */
    authenticate() {
        if (window.cordova) {
            return this.authCordova();
        }
        else {
            return this.authBrowser();
        }
    }

    /**
     * Authenticate in browser.
     */
    authBrowser() {
        const authUrl = this.dbx.getAuthenticationUrl(document.location);
        return Radio.request('components/confirm', 'show', {
            content: _.i18n('dropbox.auth confirm'),
        })
        .then(answer => {
            if (answer === 'confirm') {
                window.location = authUrl;
            }
        });
    }

    /**
     * Authenticate in Cordova environment (requires inappbrowser plugin).
     *
     * @returns {Promise} - true if authenticated
     */
    authCordova() {
        return new Promise(resolve => {
            this.dbx.authenticateWithCordova(
                accessToken => {
                    this.configs.accessToken = accessToken;
                    resolve(true);
                },
                () => resolve(false)
            );
        });
    }

    /**
     * Save the access token in configs.
     *
     * @param {String} accessToken
     * @returns {Promise}
     */
    saveAccessToken(accessToken) {
        return Radio.request('collections/Configs', 'saveConfig', {
            config: {name: 'dropboxAccessToken', value: accessToken},
        })
        .then(() => {
            // Redirect to the main page again
            Radio.request('utils/Url', 'navigate', {url: '/'});
            this.configs.accessToken = accessToken;
            return true;
        });
    }

    /**
     * Find all models of a particular collection type.
     *
     * @param {String} profileId
     * @param {String} type - [notes|notebooks|tags|files]
     * @returns {Promise}
     */
    find({profileId, type}) {
        return this.readDir({path: `/${profileId || 'default'}/${type}`})
        .then(resp => {
            const promises = [];

            _.each(resp.entries, file => {
                if (file.name.search('.json') !== -1) {
                    promises.push(this.readFile({path: file.path_lower}));
                }
            });

            return Promise.all(promises);
        });
    }

    /**
     * Read a directory on Dropbox.
     *
     * @param {String} {path} - path of the directory
     * @returns {Promise}
     */
    readDir({path}) {
        return this.dbx.filesListFolder({
            path,
            include_deleted : false, // eslint-disable-line
        })
        .catch(err => {
            // Empty folder
            if (err.status === 409) {
                return [];
            }

            return Promise.reject(err);
        });
    }

    /**
     * Read a file on Dropbox.
     *
     * @param {String} {path} - path of the file
     * @returns {Promise}
     */
    readFile({path}) {
        return this.dbx.filesDownload({path})
        .then(resp => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.addEventListener('loadend', () => {
                    resolve(JSON.parse(reader.result));
                });
                reader.readAsText(resp.fileBlob);
            });
        });
    }

    /**
     * Find a Backbone model on Dropbox.
     *
     * @param {Object} {model}
     * @returns {Promise} resolves with a note object
     */
    findModel({model}) {
        if (!model.id) {
            return Promise.resolve();
        }

        return this.readFile({path: this.getModelPath(model)});
    }

    /**
     * Save a Backbone model to Dropbox.
     *
     * @param {Object} {model} - Backbone model
     * @returns {Promise}
     */
    saveModel({model}) {
        // Don't do anything with empty models
        if (!model.id) {
            return Promise.resolve();
        }

        return this.dbx.filesUpload({
            path       : this.getModelPath(model),
            autorename : false,
            mode       : {'.tag': 'overwrite'},
            contents   : JSON.stringify(model.getData()),
        });
    }

    /**
     * Get a model's Dropbox path.
     *
     * @param {Object} model - Backbone model
     * @returns {String}
     */
    getModelPath(model) {
        return `/${model.profileId}/${model.storeName}/${model.id}.json`;
    }

}
