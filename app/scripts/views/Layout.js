/**
 * @module views/Layout
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';
import Radio from 'backbone.radio';
import deb from 'debug';

const log = deb('lav:views/Layout');

/**
 * Layout view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Layout extends Mn.View {

    get template() {
        const tmpl = require('../templates/layout.html');
        return _.template(tmpl);
    }

    /**
     * Radio channel.
     *
     * @returns {Object}
     */
    get channel() {
        return Radio.channel('Layout');
    }

    /**
     * el.
     *
     * @returns {String} #wrapper
     */
    el() {
        return '#wrapper';
    }

    /**
     * Regions.
     *
     * @returns {Object}
     */
    regions() {
        return {
            sidebarNavbar : '#sidebar--navbar',
            sidebar       : '#sidebar--content',
            content       : '#content',
        };
    }

    /**
     * Initialize.
     *
     * @listens Layout#show
     * @listens Layout#empty
     * @listens Layout#add
     */
    initialize() {
        this.$body = $('body');

        // Start replying to requests
        log('initialized');
        this.channel.reply({
            show   : this.show,
            empty  : this.empty,
            add    : this.add,
            toggle : this.toggle,
        }, this);
    }

    /**
     * Show a view in a region.
     *
     * @param {Object} options
     * @param {String} options.region
     * @param {Object} options.view
     */
    show(options) {
        log(`rendering ${options.region} region`);
        this.showChildView(options.region, options.view);
    }

    /**
     * Empty a region.
     *
     * @param {Object} options
     * @param {String} options.region
     */
    empty(options) {
        this.getRegion(options.region).empty();
    }

    /**
     * Add a new region.
     *
     * @param {Object} options
     * @param {String} options.region - the name of a region
     * @param {String} (options.html)
     */
    add(options) {
        if (this.getRegion(options.region)) {
            return false;
        }

        this.$body.append(options.html || `<div id="${options.region}"/>`);
        this.addRegion(options.region, `#${options.region}`);
    }

    /**
     * Show/hide a region.
     *
     * @param {Object} options
     * @param {String} options.region - the name of a region
     */
    toggle(options) {
        this.getRegion(options.region).$el.toggleClass('hidden');
    }

}
