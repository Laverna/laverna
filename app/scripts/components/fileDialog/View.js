/**
 * @module components/fileDialog/View
 */
/* global Modernizr */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Dropzone from 'dropzone';
import ModalForm from '../../behaviors/ModalForm';

/**
 * File dialog view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('./templates/dialog.html');
        return _.template(tmpl);
    }

    /**
     * Dropzone template file.
     *
     * @prop {String}
     */
    get dropzoneTemplate() {
        return require('./templates/dropzone.html');
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

    ui() {
        return {
            url    : '[name=url]',
            okBtn  : '#ok-btn',
            attach : '#btn-attach',
        };
    }

    events() {
        return {
            'keyup @ui.url'      : 'toggleAttachBtn',
            'click .attach-file' : 'attachFile',
        };
    }

    constructor(...args) {
        super(...args);

        /**
         * An array of files saved for uploading.
         *
         * @prop {Array}
         */
        this.files = [];
    }

    /**
     * Initialize Dropzone.
     */
    onShownModal() {
        // File uploading is allowed only if either Indexeddb or WebSQL is supported
        if (Modernizr.indexeddb || Modernizr.websqldatabase) {
            this.dropzone = new Dropzone('.dropzone', {
                url                : '/#notes',
                clickable          : true,
                accept             : _.bind(this.getImage, this),
                thumbnailWidth     : 100,
                thumbnailHeight    : 100,
                previewTemplate    : this.dropzoneTemplate,
                dictDefaultMessage : _.i18n('Drop files'),
            });
        }
    }

    /**
     * Show attach button if url input is not empty.
     */
    toggleAttachBtn() {
        this.ui.okBtn.toggleClass('hidden', this.ui.url.val().trim() !== '');
        this.ui.attach.toggleClass('hidden', this.ui.url.val().trim() === '');
    }

    /**
     * Trigger "save" event.
     *
     * @param {Object} e
     */
    attachFile(e) {
        e.preventDefault();
        this.trigger('save', {isFile: true});
    }

    /**
     * Save file data to this.files property.
     *
     * @param {Object} file
     */
    getImage(file) {
        // Empty URL input to hide attach button
        this.ui.url.val('').trigger('keyup');

        const reader  = new FileReader();
        reader.onload = evt => {
            this.files.push({
                name     : file.name,
                src      : evt.target.result,
                fileType : file.type,
            });
        };

        reader.readAsDataURL(file);
    }

}
