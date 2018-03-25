/**
 * @module components/share/Users
 */
import _ from 'underscore';
import Mn from 'backbone.marionette';

/**
 * Show trusted users.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Users extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    events() {
        return {
            'click .share--toggle' : 'share',
        };
    }

    modelEvents() {
        return {
            'change:sharedWith': 'render',
        };
    }

    collectionEvents() {
        return {
            'add change update': 'render',
        };
    }

    /**
     * Trigger "share" method.
     *
     * @param {Object} e
     */
    share(e) {
        const username = this.$(e.currentTarget).attr('data-user');
        this.triggerMethod('share', {username});
    }

    serializeData() {
        return this.options;
    }

}
