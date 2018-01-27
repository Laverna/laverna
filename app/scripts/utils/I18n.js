/**
 * @module utils/I18n
 */
import _ from 'underscore';
import i18next from 'i18next';
import i18nextXhr from 'i18next-xhr-backend';
import Radio from 'backbone.radio';
import deb from 'debug';

import locales from '../../locales/locales.json';

const log = deb('lav:utils/I18n');

/**
 * I18next helper. It fetches locales and initializes the library.
 *
 * @class
 * @license MPL-2.0
 */
export default class I18n {

    /**
     * Initialize i18next.
     *
     * @returns {Promise}
     */
    initialize() {
        log('init');

        return this.getLang()
        .then(lng => this.initLocale(lng))
        .catch(err => {
            log('error', err);
            return Promise.reject(err);
        });
    }

    /**
     * Initialize i18next.
     *
     * @param {String} lng - locale name (en, fr...)
     * @returns {Promise} the promise is resolved once i18next is ready
     */
    initLocale(lng) {
        const options = {
            lng,
            fallbackLng  : ['en'],
            ns           : [''],
            defaultNS    : '',
            backend      : {
                loadPath : 'locales/{{lng}}/translation.json',
            },
        };

        // Enable XHR module
        i18next.use(i18nextXhr);

        // Initialize i18next
        return new Promise((resolve, reject) => {
            i18next.init(options, resolve, reject);
        });
    }

    /**
     * Get language either from configs or autodect it from
     * browser settings.
     *
     * @returns {Promise}
     * @todo detect language in Cordova
     */
    getLang() {
        const lng = Radio.request('collections/Configs', 'findConfig', {
            name: 'appLang',
        });

        if (lng || typeof window.navigator === 'undefined') {
            return Promise.resolve(lng);
        }

        return Promise.resolve(this.getBrowserLang());
    }

    /**
     * Get language from browser settings.
     *
     * @returns {String}
     */
    getBrowserLang() {
        // Keys by which language settings can be found in browsers
        const keys = ['languages', 'language', 'userLanguage', 'browserLanguage'];
        const localeKeys = _.keys(locales);

        return _.chain(window.navigator)
        .pick(keys)
        .values()
        .flatten()
        .compact()
        .map(key => key.replace('-', '_').toLowerCase())
        .find(key => _.contains(localeKeys, key))
        .value();
    }

}

/**
 * Add a new initializer once the app is ready.
 */
function initialize() {
    const i18n     = new I18n();
    const callback = () => i18n.initialize();

    // Initialize i18n at start
    Radio.request('utils/Initializer', 'add', {
        callback,
        name    : 'App:utils',
    });

    // Initialize i18n again because every profile can use a different locale
    Radio.request('utils/Initializer', 'add', {
        callback,
        name    : 'App:last',
    });

    return callback;
}

Radio.once('App', 'init', initialize);
export {initialize};
