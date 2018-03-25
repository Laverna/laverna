/**
 * @module components/settings/show/keybindings/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Behavior from '../Behavior';

/**
 * Keybindings settings view.
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

    serializeData() {
        return this.options;
    }

    templateContext() {
        return {
            /**
             * Return an array of models filtered by their names.
             *
             * @param {String} str
             * @returns {Array}
             */
            filter(str) {
                return this.collection.filterByName(str);
            },

            /**
             * Application wide shortcuts.
             *
             * @returns {Array}
             */
            appShortcuts() {
                return this.collection.appShortcuts();
            },
        };
    }

}
