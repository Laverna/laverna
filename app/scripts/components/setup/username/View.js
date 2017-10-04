/**
 * @module components/setup/username/View
 */
import _ from 'underscore';
import Radio from 'backbone.radio';
import View from '../ContentView';

/**
 * Ask for a user name.
 *
 * @class
 * @extends module:components/setup/ContentView
 * @license MPL-2.0
 */
export default class Username extends View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    get importChannel() {
        return Radio.channel('components/importExport');
    }

    ui() {
        return {
            username     : 'input[name=username]',
            signalServer : 'input[name=signalServer]',
            next         : '#welcome--next',
            warning      : '.welcome--warning',
            alert        : '.alert',
            importInput  : '#import--data',
        };
    }

    events() {
        return _.extend(super.events(), {
            'click #welcome--import': 'triggerImport',
            'change #import--data'  : 'importData',
        });
    }

    serializeData() {
        return {
            configs: Radio.request('collections/Configs', 'findConfigs'),
        };
    }

    initialize() {
        this.listenTo(this.importChannel, 'completed', this.showImportMessage);
    }

    /**
     * Show file dialog.
     *
     * @param {Object} e
     */
    triggerImport(e) {
        e.preventDefault();
        this.ui.importInput.click();
    }

    /**
     * Import everything from the previous device.
     *
     * @param {Object} e
     */
    importData(e) {
        const {files} = e.target;
        if (!files.length) {
            return;
        }

        this.importChannel.request('import', {files});
    }

    /**
     * Show a message with the import result.
     *
     * @param {Object} data={}
     */
    showImportMessage(data = {}) {
        this.ui.warning.removeClass('hidden');
        this.ui.alert.text(_.i18n(data.error ? 'Import error' : 'Import success'));
    }

    /**
     * Disable "next" button if username is empty.
     */
    onInputChange() {
        this.ui.next.attr('disabled', !this.ui.username.val().length);
    }

    /**
     * Check if a username is free.
     */
    onClickNext() {
        this.triggerMethod('check:user', {
            username     : this.ui.username.val().trim(),
            signalServer : this.ui.signalServer.val().trim(),
        });
    }

    /**
     * If the username isn't free, enable all button and
     * show key pair upload button.
     */
    onNameTaken({user}) {
        this.options.user = user;
        this.ui.warning.removeClass('hidden');
        this.ui.alert.text(_.i18n(`This username is taken.
            If it was you who claimed this username, upload your key pair
            or try another username.`));
    }

    /**
     * Before saving the key, check if the fingerprint matches
     * the fingerprint on the signaling server.
     *
     * @param {Object} {key}
     */
    onReadyKey({key}) {
        const isEqual = this.options.user.fingerprint === key.primaryKey.fingerprint;

        if (isEqual) {
            return super.onReadyKey({key});
        }

        return this.ui.alert.text(_.i18n(`You selected a wrong key!
            Perhaps it is not your account.`));
    }

}
