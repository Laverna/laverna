/**
 * @module components/setup/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

// Content views
import Username from './username/View';
import Register from './register/View';
import Export   from './export/View';

/**
 * First start help view.
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

    get className() {
        return 'container text-center -auth';
    }

    regions() {
        return {
            content: '#welcome--content',
        };
    }

    /**
     * 1. Trigger "import" if the button is clicked.
     * 2. Trigger "export" if the last button is clicked.
     *
     * @prop {Object}
     */
    triggers() {
        return {
            'click #welcome--import' : 'import',
            'click #welcome--last'   : 'export',
        };
    }

    events() {
        return {
            'click .btn--import'   : 'clickInput',
            'change #import--key'  : 'checkFile',
        };
    }

    childViewEvents() {
        return {
            'show:username': 'showUsername',
            'go:auth'      : 'destroy',
        };
    }

    /**
     * Show "username" view.
     */
    onRender() {
        this.showUsername();
    }

    /**
     * Show the view that checks if a username exists.
     */
    showUsername() {
        this.showChildView('content', new Username(this.options));
    }

    /**
     * Show the view where a user can enter their passphrase or
     * upload their key pair to register a new account.
     */
    showRegister(data = {}) {
        this.showChildView('content', new Register(data));
    }

    /**
     * Click on file input to show a dialog where a user
     * can choose their key pair.
     *
     * @param {Object} e
     */
    clickInput(e) {
        const id = this.$(e.currentTarget).attr('data-file');
        this.$(id).click();
    }

    /**
     * If a file is selected, trigger read:key event.
     *
     * @param {Object} e
     */
    checkFile(e) {
        const {files} = e.target;
        if (files.length) {
            this.trigger('read:key', {file: files[0]});
        }
    }

    /**
     * Warn a user that they need to keep their private key in a safe place.
     *
     * @param {Object} data
     */
    onSaveAfter(data) {
        this.showChildView('content', new Export(data));
    }

}
