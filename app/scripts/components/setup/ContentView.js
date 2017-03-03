/**
 * @module components/setup/ContentView
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * The main content view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class ContentView extends Mn.View {

    events() {
        return {
            'keyup input'          : 'onInputChange',
            'click #welcome--next' : 'onClickNext',
        };
    }

    /**
     * If the key a user has provided is ready, trigger "save" event.
     *
     * @param {Object} key
     */
    onReadyKey({key}) {
        const {user, username} = this.options;

        this.triggerMethod('save', {
            username : user ? user.username : username,
            register : (this.register === true),
            keys     : {
                privateKey: key.armor(),
                publicKey : key.toPublic().armor(),
            },
        });
    }

    /**
     * Failed to save changes or claim the username.
     *
     * @param {String} err
     */
    onSaveError({err}) {
        const text = _.cleanXSS(err);
        this.ui.alert.removeClass('hidden').text(_.i18n(text));
    }

    /**
     * Failed to read a key.
     *
     * @param {String} err
     */
    onKeyError({err}) {
        this.onSaveError({err});
    }

    serializeData() {
        return this.options;
    }

}
