/**
 * @module utils/Notify
 */
import Radio from 'backbone.radio';
import deb from 'debug';

const log = deb('lav:utils/Notify');

/**
 * Notification util.
 *
 * @class
 * @license MPL-2.0
 */
export default class Notify {

    /**
     * Notification channel (utils/Notify)
     *
     * @returns {Object}
     */
    get channel() {
        return Radio.channel('utils/Notify');
    }

    constructor() {
        if (this.isSupported()) {
            this.channel.reply({
                show: this.show,
            }, this);
        }
    }

    /**
     * Check whether the browser supports desktop notifications.
     *
     * @returns {Boolean}
     */
    isSupported() {
        return ('Notification' in window && !window.cordova);
    }

    /**
     * Request the notification permission.
     *
     * @returns {Promise}
     */
    init() {
        if (!this.isSupported()) {
            log('Your browser does not support notifications!');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            Notification.requestPermission(permission => {
                if (permission === 'granted') {
                    return resolve();
                }
                else {
                    reject('Please allow us to show notifications!');
                }
            });
        });
    }

    /**
     * Show a notification.
     *
     * @param {String} {title
     * @param {String} body}
     */
    show({title, body}) {
        log('showing a notification');
        return new Notification(title, {body});
    }

}

Radio.once('App', 'init', () => {
    Radio.request('utils/Initializer', 'add', {
        name    : 'App:utils',
        callback: () => new Notify().init(),
    });
});
