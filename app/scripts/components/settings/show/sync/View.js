/**
 * @module components/settings/show/keybindings/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Behavior from '../Behavior';
// import constants from '../../../../constants';
import Users from './Users';

/**
 * Sync settings view.
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
     * Behaviors.
     *
     * @see module:components/settings/show/Behavior
     * @returns {Array}
     */
    get behaviors() {
        return [Behavior];
    }

    regions() {
        return {
            users: '#sync--users',
        };
    }

    onRender() {
        this.showUsers();
    }

    /**
     * Show a list of users whom you trust.
     */
    showUsers() {
        this.showChildView('users', new Users({
            collection: this.options.users,
        }));
    }

    serializeData() {
        return {
            models: this.collection.getConfigs(),
        };
    }

}
