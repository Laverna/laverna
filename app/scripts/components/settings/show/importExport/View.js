/**
 * @module components/settings/show/importExport/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';

/**
 * Import/export settings view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    /**
     * ImportExport component Radio channel.
     *
     * @prop {Object}
     */
    get channel() {
        return Radio.channel('components/importExport');
    }

    events() {
        return {
            'click .btn--import'       : 'triggerClick',
            'change #import--data'     : 'importData',
            'change #import--evernote' : 'importEvernote',
            'click #export--data'      : 'exportData',
            'click #export--key'       : 'exportKey',
        };
    }

    /**
     * Emulate click on the file button to show file chooser.
     *
     * @param {Object} e
     */
    triggerClick(e) {
        e.preventDefault();
        const input = this.$(e.currentTarget).attr('data-file');
        this.$(input).click();
    }

    /**
     * Recover from a backup.
     */
    importData(e) {
        const {files} = e.target;
        if (!files.length) {
            return;
        }

        this.channel.request('import', {files});
    }

    /**
     * Import notes from Evernote backup.
     */
    importEvernote(e) {
        const {files} = e.target;
        this.channel.request('importEvernote', {files});
    }

    /**
     * Export everything from Laverna.
     */
    exportData() {
        this.channel.request('export');
    }

    /**
     * Export OpenPGP private key.
     */
    exportKey() {
        this.channel.request('export', {exportKey: true});
    }

}
