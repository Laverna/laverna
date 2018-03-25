/**
 * @module utils/Title
 */
import Radio from 'backbone.radio';
import _ from 'underscore';
import deb from 'debug';

const log = deb('lav:utils/Title');

/**
 * Title util.
 *
 * @class
 * @license MPL-2.0
 */
export default class Title {

    /**
     * Radio channel (utils/Title)
     *
     * @returns {Object}
     */
    get channel() {
        return Radio.channel('utils/Title');
    }

    /**
     * Title options.
     */
    get options() {
        return _.extend({}, this.opt, this._opt || {});
    }

    /**
     * Set title options.
     *
     * @param {Object} options
     */
    set options(options) {
        this._opt = _.pick(options, _.keys(this.opt));
    }

    /**
     * @listens this.channel#setTitle - set the main title
     * @listens this.channel#setSection - set section title
     */
    constructor() {
        /**
         * @prop opt
         * @prop {String} opt.title - the main title
         * @prop {String} opt.section - notebook or tag name, etc...
         * @prop {String} opt.profileId - current database profile ID
         * @prop {String} opt.app - Laverna
         */
        this.opt = {
            title     : '',
            section   : '',
            profileId : '',
            app       : 'Laverna',
        };

        this.channel.reply({
            set: this.set,
        }, this);
    }

    /**
     * Set title.
     *
     * @param {Object} options = {}
     * @returns {Promise}
     */
    set(options = {}) {
        // Try to set section title
        if (options.filter) {
            return this.setSection(options)
            .then(() => this.setTitle(this.options));
        }

        return Promise.resolve(this.setTitle(options));
    }

    /**
     * Set document title.
     *
     * @param {Object} options
     * @param {String} (options.title)
     * @param {String} (options.query) - notebook or tag name
     * @param {String} (options.profileId)
     * @returns {Object} this.options
     */
    setTitle(options) {
        log('setTitle', options);
        if (options.title && !options.section) {
            this.options = {title: options.title};
        }
        else {
            this.options = options;
        }

        // Prepare an array of titles removing empty ones
        let title = _.compact(_.values(this.options));
        title     = _.cleanXSS(title.join(' - '));

        // Set document title
        document.title = title;
        return this.options;
    }

    /**
     * Set section title.
     *
     * @param {Object} options
     * @returns {Promise}
     */
    setSection(options) {
        let promise;
        this.options = options;

        if (options.query && this[`${options.filter}Title`]) {
            promise = this[`${options.filter}Title`](options);
        }
        else {
            promise = Promise.resolve(this.getTitleFromFilter(options));
        }

        return promise
        .then(title => this.options = _.extend({section: title}, options));
    }

    /**
     * Get title from filter arguments.
     *
     * @param {Object} options
     * @returns {String}
     */
    getTitleFromFilter(options) { // eslint-disable-line complexity
        let title;

        // Use "query" as title if it's search or tag filter
        if (options.query && _.indexOf(['search', 'tag'], options.filter) > -1) {
            title = options.query;
        }
        // Or use filter name as title
        else {
            const {filter} = options;
            title = (!filter || filter !== 'active') ? options.filter : 'All notes';
            title = _.i18n(title);
        }

        return _.capitalize(title);
    }

    /**
     * Use notebook name as title instead of ID.
     *
     * @param {Object} options
     * @param {String} options.query - notebook ID
     * @returns {Promise} resolves with the notebook name
     */
    notebookTitle(options) {
        const opt = {id: options.query, profileId: options.profileId};

        return Radio.request('collections/Notebooks', 'findModel', opt)
        .then(model => _.capitalize(model.get('name')));
    }

}

Radio.once('App', 'init', () => new Title());
