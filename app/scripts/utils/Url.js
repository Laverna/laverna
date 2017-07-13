/**
 * @module utils/Url
 */
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import _ from 'underscore';
import $ from 'jquery';

/**
 * URL helper.
 *
 * @class
 * @license MPL-2.0
 */
export default class Url {

    /**
     * Radio channel.
     *
     * @returns {Object} utils/Url
     */
    get channel() {
        return Radio.channel('utils/Url');
    }

    /**
     * Notes filter parameters with their route fragments.
     *
     * @returns {Object}
     */
    get noteFilters() {
        return {
            filter : '/f/',
            query  : '/q/',
            page   : '/p',
        };
    }

    constructor() {
        // Save the original location hash
        this.hashOnStart = document.location.hash;

        // Reload the page if profileId has changed
        this.profileId = this.getProfileId();
        $(window).on('hashchange', () => this.checkProfile());

        // Start replying to requests
        this.channel.reply({
            getHashOnStart : () => this.hashOnStart,
            getHash        : this.getHash,
            navigate       : this.navigate,
            navigateBack   : this.navigateBack,
            getProfileId   : this.getProfileId,
            getProfileLink : this.getProfileLink,
            getNotesLink   : this.getNotesLink,
            getNoteLink    : this.getNoteLink,
            getFileLink    : this.getFileLink,
        }, this);
    }

    /**
     * Return the current history hash.
     *
     * @returns {String}
     */
    getHash() {
        return Backbone.history.fragment;
    }

    /**
     * Reload the page if profileId has changed.
     */
    checkProfile() {
        if (this.getProfileId() !== this.profileId) {
            window.location.reload();
        }
    }

    /**
     * Navigate to a URL.
     *
     * @param {Object} options
     * @param {String} (options.url)
     * @param {Object} (options.filterArgs)
     * @param {Boolean} (options.includeProfile) - prepend the profile link
     * to the URL
     */
    navigate(options) {
        let {url} = options;

        // For default, trigger = true
        if (_.isUndefined(options.trigger)) {
            options.trigger = true; // eslint-disable-line
        }

        // Generate link to a note
        if (options.filterArgs) {
            url = this.getNoteLink(options);
        }

        // Prepend the profile link
        if (options.includeProfile) {
            url = this.getProfileLink({url});
        }

        Backbone.history.navigate(url, options);
    }

    /**
     * Navigate back.
     *
     * @param {Object} options
     * @param {String} (options.url) - this URL will be used if history is empty
     */
    navigateBack(options) {
        if (this.historyLength() === 0) {
            const url = options.url || '/notes';
            return this.navigate({url, includeProfile: true});
        }

        window.history.back();
    }

    /**
     * Return window.history.length
     *
     * @returns {Number}
     */
    historyLength() {
        return window.history.length;
    }

    /**
     * Prepend the profile link to the provided URL.
     *
     * @param {Object} options
     * @param {String} (options.url)
     * @param {String} (options.profileId)
     * @returns {String} /p/profileName/my-url
     */
    getProfileLink(options = {}) {
        const profileId = options.profileId || this.getProfileId();

        // Remove the leading slash and profile link
        const url = (options.url || '/')
        .replace(/^\//, '')
        .replace(/\/?p\/[^/]*\//, '');

        return !profileId ? url : `/p/${profileId}/${url}`;
    }

    /**
     * Return current profile ID.
     *
     * @returns {String}
     */
    getProfileId() {
        const profileId = document.location.hash.match(/\/?p\/([^/]*)\//);
        return (!profileId ? profileId : profileId[profileId.index]);
    }

    /**
     * Generate a link to a particular note.
     *
     * @param {Object} options
     * @param {Object} (options.filterArgs) - filter parameters
     * @param {Object} (options.model) - note model
     * @param {String} (options.id) - ID of a note
     * @returns {String}
     */
    getNoteLink(options) {
        const url = this.getNotesLink(options);
        const id  = options.model ? options.model.id : options.id;

        return id ? `${url}/show/${id}` : url;
    }

    /**
     * Generate a link to notes list from filter parameters.
     *
     * @param {Object} options
     * @param {Object} (options.filterArgs) - filter parameters
     * @returns {String}
     */
    getNotesLink(options) {
        const filterArgs = options.filterArgs || {};
        let url          = '/notes';

        _.each(this.noteFilters, (value, filter) => {
            if (_.has(filterArgs, filter) && filterArgs[filter]) {
                url += `${value}${filterArgs[filter]}`;
            }
        });

        return this.getProfileLink({url, profileId: filterArgs.profileId});
    }

    /**
     * Generate a link to a file.
     *
     * @param {Object} options
     * @param {Boolean} (options.blob) - true if Object URL should be generated
     * @param {Object} (options.model) - file model
     * @param {String} (options.src)
     * @returns {String}
     */
    getFileLink(options) {
        if (!options.blob) {
            return `#file:${options.model.id}`;
        }

        const url = window.URL || window.webkitURL;
        const src = (options.src || options.model.get('src'));
        return url.createObjectURL(src);
    }

}

// Instantiate automatically
Radio.once('App', 'init', () => new Url());
