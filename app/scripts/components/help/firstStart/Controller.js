/**
 * @module components/help/firstStart/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import * as openpgp from 'openpgp';
import View from './View';
import deb from 'debug';

const log = deb('lav:components/help/firstStart/Controller');

/**
 * First start controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Configs radio channel.
     *
     * @prop {Object}
     */
    get configsChannel() {
        return Radio.channel('collections/Configs');
    }

    /**
     * Return true if encryption is enabled.
     *
     * @prop {Boolean}
     */
    get encrypt() {
        return this.configsChannel.request('findConfig', {name: 'encrypt'}) === '1';
    }

    /**
     * Return true if it is the first start.
     *
     * @prop {Boolean}
     */
    get firstStart() {
        const val = this.configsChannel.request('findConfig', {name: 'firstStart'});
        return Number(val) === 1;
    }

    /**
     * Profile ID.
     *
     * @prop {String}
     */
    get profileId() {
        return Radio.request('utils/Url', 'getProfileId');
    }

    onDestroy() {
        log('destroyed');
    }

    init() {
        if (!this.firstStart) {
            return Promise.resolve(this.destroy());
        }

        return this.check()
        .then(isFirstStart => this.show(isFirstStart))
        .catch(err => log('error', err));
    }

    /**
     * Check if it is indeed the first start.
     *
     * @returns {Promise} resolves with true if it is the first start
     */
    check() {
        // If encryption is enabled, it means it isn't the first start
        if (this.encrypt) {
            return Promise.resolve(false);
        }

        const profileId = this.profileId;

        // Check if collections are not empty
        return Promise.all([
            Radio.request('collections/Notes', 'find', {profileId}),
            Radio.request('collections/Notebooks', 'find', {profileId}),
            Radio.request('collections/Tags', 'find', {profileId}),
        ])
        .then(collections => {
            log('first start collections', collections);
            const res = _.filter(collections, coll => coll.length > 0);
            return res.length === 0;
        });
    }

    /**
     * Render the view.
     *
     * @param {Boolean} isFirstStart
     */
    show(isFirstStart) {
        // Do nothing if it isn't the first start
        if (!isFirstStart) {
            return this.mark()
            .then(() => this.destroy());
        }

        // Clear old encryption secure key from session storage
        window.sessionStorage.clear();

        this.view = new View();
        Radio.request('Layout', 'show', {region: 'modal', view: this.view});
        this.listenToEvents();
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'save', this.save);
        this.listenTo(this.view, 'import', this.import);
        this.listenTo(this.view, 'download', this.download);
        this.listenTo(this.view, 'destroy', this.onViewDestroy);
    }

    /**
     * Save settings.
     *
     * @fires this.view#save:before
     * @fires this.view#save:after
     * @returns {Promise}
     */
    save() {
        this.view.triggerMethod('save:before');

        return this.saveAccount()
        .then(account => this.generateKeyPair(account))
        .then(() => this.view.triggerMethod('save:after'))
        .catch(err => log('save error', err));
    }

    /**
     * Save email and name.
     *
     * @returns {Promise} - resolves with account information (object)
     */
    saveAccount() {
        const value = {
            email : this.view.ui.email.val().trim(),
            name  : this.view.ui.name.val().trim(),
        };

        return this.configsChannel.request('saveModelObject', {
            profileId : this.profileId,
            data      : {value, name: 'account'},
        })
        .then(() => value);
    }

    /**
     * Generate OpenPGP key pair and save it.
     *
     * @todo handle errors
     * @param {Object} account
     * @param {String} account.email
     * @param {String} account.name
     * @returns {Promise}
     */
    generateKeyPair(account) {
        const passphrase = this.view.ui.password.val().trim();

        return Radio.request('models/Encryption', 'generateKeys', {
            passphrase,
            userIds: [account],
        })
        .then(keys => this.saveKeyPair(keys))
        .catch(err => log('error', err));
    }

    /**
     * Save the key pair.
     *
     * @param {Object} keys
     * @returns {Promise}
     */
    saveKeyPair(keys) {
        const key     = openpgp.key.readArmored(keys.publicKey).keys[0];
        const configs = [
            {name: 'privateKey', value: keys.privateKey},
            {name: 'publicKeys', value: {[key.primaryKey.fingerprint]: keys.publicKey}},
            {name: 'encrypt', value: 1},
        ];

        return this.configsChannel.request('saveConfigs', {
            configs,
            profileId : this.profileId,
        });
    }

    /**
     * Save cloud storage settings.
     *
     * @returns {Promise}
     */
    saveCloud() {
        const value = this.view.ui.cloudStorage.val().trim();

        // Do nothing if storage wasn't provided
        if (!value.length || value === '0') {
            return Promise.resolve();
        }

        return this.configsChannel.request('saveModelObject', {
            profileId : this.profileId,
            data      : {value, name: 'cloudStorage'},
        });
    }

    /**
     * Import existing data from a ZIP archive to Laverna.
     */
    import() {
        this.dontReload = true;
        Radio.request('utils/Url', 'navigate', {
            includeProfile : true,
            url            : '/settings/importExport',
        });
        this.view.destroy();
    }

    /**
     * Download Laverna backup.
     *
     * @returns {Promise}
     */
    download() {
        return Radio.request('components/importExport', 'export')
        .then(() => this.view.destroy());
    }

    /**
     * Mark that a user went through the first start installation proccess.
     *
     * @returns {Promise}
     */
    mark() {
        return this.configsChannel.request('saveModelObject', {
            data      : {name: 'firstStart', value: '0'},
            profileId : this.profileId,
        });
    }

    /**
     * Change the value of firstStart config to "0" and reload the page.
     *
     * @returns {Promise}
     */
    onViewDestroy() {
        return this.mark()
        .then(() => {
            if (this.dontReload) {
                return this.destroy();
            }

            window.location.reload();
        });
    }

}
