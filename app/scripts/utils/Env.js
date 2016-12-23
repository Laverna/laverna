/**
 * @module utils/Env
 */
/* global Modernizr */
import device from 'device-detect.js';
import Radio from 'backbone.radio';
// import Modernizr from 'modernizr';
// import deb from 'debug';

// const log = deb('lav:utils/Env');

/**
 * @class
 * @license MPL-2.0
 */
export default class Env {

    /**
     * @listens utils/Env#isMobile - returns true if it's a mobile device
     * @listens utils/Env#isWebkit - returns true if it's a webkit based device
     * @listens utils/Env#canUseWorkers - returns if the device supports web workers
     * @listens utils/Env#platform - returns platform of the user
     */
    constructor() {
        // Start replying to requests
        this.channel.reply({
            isMobile      : this.isMobile,
            isWebkit      : this.isWebkit,
            canUseWorkers : this.canUseWorkers,
            platform      : this.platform,
        });
    }

    /**
     * Return user agent.
     *
     * @returns {String} user agent
     */
    get ua() {
        return window.navigator.userAgent;
    }

    get channel() {
        return Radio.channel('utils/Env');
    }

    /**
     * Determine if it's a mobile or a tablet.
     *
     * @returns {Boolean}
     */
    get isMobile() {
        return device.mobile() || device.tablet();
    }

    /**
     * Determine if it's a webkit based device
     *
     * @returns {Boolean}
     */
    get isWebkit() {
        return 'WebkitAppearance' in document.documentElement.style;
    }

    /**
     * Return true if it's Palemon or Sailfish browser.
     *
     * @returns {Boolean}
     */
    get isPalemoonOrSailfish() {
        return (/(palemoon|sailfish)/i.test(this.ua));
    }

    /**
     * Don't use Webworkers if:
     * 1. WebWorkers aren't available
     * 2. The app is started with file protocol
     * 3. It's a Webkit based browser
     * 4. It's Palemoon or Sailfish browser
     *
     * @returns {Boolean}
     */
    canUseWorkers() {
        const {protocol} = window.location;

        return (Modernizr.webworkers && protocol !== 'file' && !this.isWebkit &&
            !this.isPalemoonOrSailfish);
    }

    /**
     * Check the platform of the user and return it
     *
     * @returns {String}
     */
    getPlatform() {
        if (this.isMobile) {
            return 'mobile';
        }
        else if (window.requireNode) {
            return 'electron';
        }

        return 'browser';
    }

}

Radio.once('App', 'init', () => new Env());
