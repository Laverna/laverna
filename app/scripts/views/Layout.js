/**
 * @module views/Layout
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import $ from 'jquery';
import Radio from 'backbone.radio';
import deb from 'debug';

import Loader from './Loader';
import Modal from './Modal';
import Brand from './Brand';

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
            brand         : {regionClass: Brand, el: '#layout--brand'},
            modal         : {regionClass: Modal, el: '#layout--modal'},
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
            toggleContent: this.toggleContent,
            showLoader   : this.showLoader,
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
     * @param {String|Boolean} [options.html] - if it's provided, it will create
     * a new HTML element and append it to DOM
     * @param {Object} [options.regionOptions]
     */
    add(options) {
        if (this.getRegion(options.region)) {
            return false;
        }

        // Create a new HTML element
        if (options.html) {
            this.createRegionElement(options);
        }

        this.addRegion(options.region, options.regionOptions || `#${options.region}`);
    }

    /**
     * Create HTML element for a region.
     *
     * @param {Object} options
     */
    createRegionElement(options) {
        let html = options.html;

        if (typeof html !== 'string') {
            html = `<div id="${options.region}"/>`;
        }

        this.$el.append(html);
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

    /**
     * Show either sidebar or content region.
     *
     * @param {Object} options
     * @param {Boolean} options.visible - true if content region should be visible
     */
    toggleContent(options) {
        this.getRegion('sidebar').$el.toggleClass('hidden-xs', options.visible);
        this.getRegion('content').$el.toggleClass('hidden-xs', !options.visible);
    }

    /**
     * Render the loader view in a region.
     *
     * @param {Object} options
     * @param {String} options.region
     */
    showLoader(options) {
        this.show({
            region : options.region,
            view   : new Loader(),
        });
    }

}
