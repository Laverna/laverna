/**
 * @module utils/underscore
 */
import _ from 'underscore';
import i18next from 'i18next';
import xss from 'xss';

/**
 * Customize underscore template engine.
 *
 * @namespace templateSettings
 * @property {RegExp} escape - {{ myVar }} show escaped string
 * @property {RegExp} interpolate - {= myVar } - show string without escaping
 * @property {RegExp} evaluate - <% code %> - execute JS code
 */
_.templateSettings = {
    escape      : /\{\{([\s\S]+?)\}\}/g,
    interpolate : /\{=([\s\S]+?)\}/g,
    evaluate    : /<%([\s\S]+?)%>/g,
};

/**
 * Add some helper functions to Underscore.
 *
 * @license MPL-2.0
 */
_.mixin({

    /**
     * I18next.
     *
     * @param {String} str
     * @returns {String}
     */
    i18n(...args) {
        return i18next.t(...args);
    },

    /**
     * Sanitize HTML to prevent XSS.
     *
     * @example
     * _.cleanXSS('<script>alert('yes');</script>Test'); // Result - 'test'
     * @example
     * _.cleanXSS('<script></script><b>Test</b>', true, true); // Result - 'test'
     * @param {String} str - text that needs to be sanitized
     * @param {Boolean} unescape - true if there are some escaped special characters
     * @param {Boolean} stripTags - true if you want to remove HTML tags from the text
     * @returns {String}
     */
    cleanXSS(text, unescape, stripTags) {
        let str = text;

        /*
         * Unescape the string 2 times because
         * data from Dropbox is always escaped + we escape them too.
         */
        if (unescape === true) {
            str = _.runTimes(_.unescape, 2, str);
        }

        // Remove all HTML tags
        if (stripTags === true) {
            str = _.stripTags(str);
        }

        return xss(str);
    },

    /**
     * Invoke the given function n times and return the last result.
     *
     * @example _.runTimes(_.unescape, 2, 'String');
     * @param {Function} fnc - a callback function
     * @param {Number} n - number of times the callback should run
     * @returns {} result of running a callback n times
     */
    runTimes(fnc, n, ...args) {
        const res = _.times(n, () => fnc.apply(null, args));
        return res[res.length - 1];
    },

    /**
     * Remove HTML tags from string.
     *
     * @example _.stripTags('<b>Bold</b>'); // Resulting text: 'Bold'
     * @param {String} str
     * @returns {String}
     */
    stripTags(str) {
        return str.replace(/<\/?[^>]+>/g, '');
    },

    /**
     * Convert the first letter of a string to uppercase.
     *
     * @param {String} str
     * @returns {String}
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },


    /**
     * Split string by 4 characters.
     *
     * @param {String} str
     * @returns {String}
     */
    splitBy4(str) {
        return str.match(/.{4}/g).join(' ');
    },

    /**
     * Count a number of words in text.
     *
     * @param {String} text
     * @returns {Number} number of words
     */
    countWords(text) {
        const matches = text.match(/([^\u0000-\u007F]|\w)+/g, '');
        return matches ? matches.length : 0;
    },

    /**
     * Select an option if it is active.
     *
     * @param {String} active
     * @param {String} item
     * @returns {String}
     */
    selectOption(active, item) {
        return active === item ? 'selected="selected" ' : '';
    },

});

export default _;
