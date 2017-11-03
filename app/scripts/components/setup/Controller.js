/**
 * @module components/setup/Controller
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';
import * as openpgp from 'openpgp';
import deb from 'debug';
import fileSaver from '../../utils/fileSaver';

import View from './View';

const log = deb('lav:components/setup/Controller');

/**
 * Show registration form on the first start.
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
     * App configs.
     *
     * @prop {Object}
     */
    get configs() {
        return Radio.request('collections/Configs', 'findConfigs');
    }

    /**
     * Profile ID.
     *
     * @prop {String}
     */
    get profileId() {
        return Radio.request('utils/Url', 'getProfileId');
    }

    initialize() {
        this.fileSaver = fileSaver;
    }

    onDestroy() {
        log('destroyed');
    }

    /**
     * @returns {Promise}
     */
    init() {
        // If it's not the first start, do nothing
        if (!this.isFirstStart()) {
            return Promise.resolve(this.destroy());
        }

        log('this is the first start!');
        return new Promise((resolve, reject) => {
            this.promise = {resolve, reject};
            this.show();
            this.listenToEvents();
        });
    }

    /**
     * Check if it is the first start.
     * It is the first if either username, privateKey, or publicKey is empty.
     *
     * @returns {Boolean}
     */
    isFirstStart() {
        return (
            !this.configs.username.length ||
            !this.configs.privateKey.length ||
            !this.configs.publicKey.length
        );
    }

    /**
     * Render the view.
     */
    show() {
        this.view = new View();
        Radio.request('Layout', 'show', {region: 'brand', view: this.view});
        this.view.triggerMethod('ready');
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'destroy', this.onViewDestroy);
        this.listenTo(this.view, 'import', this.import);
        this.listenTo(this.view, 'export', this.export);
        this.listenTo(this.view, 'read:key', this.readKey);

        // Child view events
        this.listenTo(this.view, 'childview:check:user', this.checkUser);
        this.listenTo(this.view, 'childview:save', this.save);
    }

    /**
     * Resolve the promise and destroy itself.
     */
    onViewDestroy() {
        this.promise.resolve();
        this.destroy();
    }

    /**
     * Check if a username is taken.
     *
     * @fires view#name:taken
     * @param {String} username
     * @param {String} signalServer
     * @returns {Promise}
     */
    checkUser({username, signalServer}) {
        const view = this.view.getChildView('content');
        Radio.request('models/Signal', 'changeServer', {signal: signalServer});

        return this.configsChannel.request('saveConfig', {
            config: {
                name  : 'signalServer',
                value : signalServer || this.configs.signalServer,
            },
        })
        .then(() => {
            return Radio.request('models/Signal', 'findUser', {username})
            .catch(err => {
                view.triggerMethod('signalServer:error', {err});
                throw new Error(err);
            });
        })
        .then(user => {
            // Show the registration form if user does not exist on the server
            if (_.isEmpty(user)) {
                return this.view.showRegister({username});
            }

            log('the username is taken!!!', user);
            view.triggerMethod('name:taken', {user});
        });
    }

    /**
     * Read a key.
     *
     * @fires view#key:error
     * @fires view#ready:key
     * @param {Object} {file}
     * @returns {Promise}
     */
    readKey({file}) {
        const reader = new FileReader();

        return new Promise(resolve => {
            reader.onload = evt => resolve(evt.target.result);
            reader.readAsText(file);
        })
        .then(armorKey => {
            const {keys, err} = openpgp.key.readArmored(armorKey);

            // Accept only a private key
            if (err || keys[0].isPublic()) {
                return this.view.getChildView('content').triggerMethod('key:error', {
                    err: 'You need to upload your private key!',
                });
            }

            log('key is', keys[0]);
            this.view.getChildView('content').triggerMethod('ready:key', {
                key: keys[0],
            });
        });
    }

    /**
     * Save OpenPGP key pair and username.
     *
     * @param {String} username
     * @param {Object} [keyData]
     * @param {Object} [keys]
     * @param {Boolean} register - true if a new account should be registered
     * @fires view#save:before
     * @fires view#save:after
     * @returns {Promise}
     */
    save({username, keyData, keys, register}) {
        const view  = this.view.getChildView('content');
        view.triggerMethod('save:before');

        log('save keys are', keys);
        return (keys ? Promise.resolve(keys) : this.generateKeyPair(keyData))
        .then(keys => this.keys = keys)
        .then(()   => this.register({username, register}))
        .then(()   => this.saveConfigs({username}))
        .then(()   => this.view.triggerMethod('save:after', {username}))
        .catch(err => {
            log('save error', err);
            view.triggerMethod('save:error', {err});
        });
    }

    /**
     * Generate a new OpenPGP key pair.
     *
     * @param {String} passphrase
     * @param {String} username
     * @returns {Promise}
     */
    generateKeyPair({passphrase, username}) {
        return Radio.request('models/Encryption', 'generateKeys', {
            passphrase,
            userIds: [{name: username}],
        });
    }

    /**
     * Claim the username on the signaling server.
     *
     * @param {String} username
     * @param {Boolean} register
     * @returns {Promise}
     */
    register({username, register}) {
        if (!register) {
            return Promise.resolve();
        }
        else if (this.keys.publicKey.search('PGP PRIVATE KEY') !== -1) {
            throw new Error('Your private key will not be uploaded');
        }

        return Radio.request('models/Signal', 'register', {
            username,
            publicKey: this.keys.publicKey,
        });
    }

    /**
     * Save the username and key pair configs.
     *
     * @param {String} username
     * @returns {Promise}
     */
    saveConfigs({username}) {
        const configs = [
            {name: 'privateKey', value: this.keys.privateKey},
            {name: 'publicKey', value: this.keys.publicKey},
            {name: 'encrypt', value: 1},
            {name: 'username', value: username},
        ];

        return this.configsChannel.request('saveConfigs', {
            configs,
            profileId: this.profileId,
        });
    }

    /**
     * Save synchronization settings.
     *
     * @returns {Promise}
     */
    saveSync() {
        const value = this.view.getChildView('content').ui.sync.val().trim();
        return this.configsChannel.request('saveConfig', {
            config    : {value, name: 'cloudStorage'},
            profileId : this.profileId,
        });
    }

    /**
     * Download the private key.
     *
     * @returns {Promise}
     */
    export() {
        return this.saveSync()
        .then(() => {
            const blob = new Blob([this.keys.privateKey], {type: 'text/plain'});
            this.fileSaver(blob, 'laverna-key.asc');
            this.view.destroy();
        });
    }

}
