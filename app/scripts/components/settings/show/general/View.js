/**
 * @module components/settings/show/general/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import i18n from 'i18next';
import locales from '../../../../../locales/locales.json';
import Behavior from '../Behavior';

/**
 * General settings view.
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

    /**
     * serializeData.
     *
     * @returns {Object}
     */
    serializeData() {
        const models = this.collection.getConfigs();

        return {
            locales,
            models,
            appLang    : (models.appLang || i18n.language) || 'en',
            profileId  : this.options.profileId,
            useDefault : this.options.useDefault.attributes,
        };
    }

    /**
     * templateContext.
     *
     * @returns {Object}
     */
    templateContext() {
        return {

            /**
             * Return true if it's the default profile.
             *
             * @returns {Boolean}
             */
            isDefaultProfile() {
                return _.indexOf([null, 'notes-db'], this.profileId) > -1;
            },

            /**
             * Selects a locale if it's active.
             *
             * @param {String} locale
             * @returns {String}
             */
            selectLocale(locale) {
                if (this.appLang === locale ||
                    this.appLang.search(locale) >= 0) {
                    return ' selected';
                }
            },

        };
    }

}
