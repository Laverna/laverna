/**
 * @module components/linkDialog/views/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Collection from './Collection';
import ModalForm from '../../../behaviors/ModalForm';

/**
 * Link dialog view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('../templates/template.html');
        return _.template(tmpl);
    }

    get className() {
        return 'modal fade';
    }

    /**
     * Behaviors.
     *
     * @see module:behaviors/ModalForm
     * @prop {Array}
     */
    get behaviors() {
        return [ModalForm];
    }

    get uiFocus() {
        return 'url';
    }

    /**
     * Regions (notes.)
     *
     * @prop {Object}
     */
    regions() {
        return {
            notes: '#noteMenu',
        };
    }

    ui() {
        return {
            url      : '[name=url]',
            dropdown : '.dropdown',
            create   : '.create',
        };
    }

    events() {
        return {
            'keyup @ui.url' : 'onUrlKeyup',
        };
    }

    triggers() {
        return {
            'click @ui.create' : 'create:note',
        };
    }

    constructor(...args) {
        super(...args);

        this.handleUrl = _.debounce(this.handleUrl, 200);
        this.listenTo(this, 'toggle:dropdown', this.toggleDropdown);
    }

    /**
     * Show notes list.
     */
    renderDropdown() {
        this.dropView = new Collection(this.options);
        this.showChildView('notes', this.dropView);
        this.listenTo(this.dropView, 'attach:link', this.attachLink);
    }

    /**
     * A user typed something in URL input.
     */
    onUrlKeyup() {
        this.handleUrl();
    }

    /**
     * Check if URL input's value is a link. If it is not, start searching for a note.
     */
    handleUrl() {
        const val = this.ui.url.val().trim();

        // If it is a link, we don't have to do anything
        if (val === '' || val.match(/^(#|(https?|file|ftp):\/)/) !== null) {
            return this.onAttachLink();
        }

        // Search for an existing note and show the create button
        this.ui.create.toggleClass('hidden', false);
        this.trigger('search', {text: val});
    }

    /**
     * When a link is attached, hide create button and dropdown menu
     */
    onAttachLink() {
        this.ui.create.addClass('hidden');
        this.ui.url.focus();
        this.toggleDropdown();
    }

    /**
     * Insert a link to the URL input.
     *
     * @param {Object} data={}
     * @param {String} data.url
     */
    attachLink(data = {}) {
        this.ui.url.val(data.url);
        this.onAttachLink();
    }

    /**
     * Hide or show the dropdown menu.
     *
     * @param {Object} data={}
     * @param {Number} data.length - the number of found items
     */
    toggleDropdown(data = {}) {
        this.ui.dropdown.toggleClass('open', data.length || false);
    }

}
