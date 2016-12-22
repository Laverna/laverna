/**
 * @module components/encryption/auth/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import View from './View';
import deb from 'debug';

const log = deb('lav:components/encryption/auth/Controller');

/**
 * Auth controller.
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

    onDestroy() {
        log('destroy');
    }

    /**
     * Ask a user for their encryption password.
     *
     * @returns {Promise} resolved once auth is successful
     */
    init() {
        // Do nothing if encryption is disabled
        if (!Number(this.configs.encrypt)) {
            this.destroy();
            return Promise.resolve();
        }

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
        this.view = new View({configs: this.configs});
        Radio.request('Layout', 'show', {
            region : 'brand',
            view   : this.view,
        });
        this.view.triggerMethod('ready');
    }

    /**
     * Start listening to events.
     */
    listenToEvents() {
        this.listenTo(this.view, 'destroy', this.destroy);
        this.listenTo(this.view, 'submit', this.onSubmit);
    }

    /**
     * Try to read the keys and decrypt the private key.
     *
     * @returns {Promise}
     */
    onSubmit() {
        const passphrase = this.view.ui.password.val().trim();

        return Radio.request('models/Encryption', 'readKeys', {
            passphrase,
            privateKey : this.configs.privateKey,
            publicKeys : this.configs.publicKeys,
        })
        .then(() => this.onSuccess())
        .catch(error => {
            log('readKeys error', error);
            this.view.triggerMethod('auth:error', {error});
        });
    }

    /**
     * Resolve the promise and destroy the view.
     */
    onSuccess() {
        this.promise.resolve();
        this.view.destroy();
    }

}
