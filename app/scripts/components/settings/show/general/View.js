/**
 * @module components/settings/show/general/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import i18n from 'i18next';
import locales from '../../../../../locales/locales.json';
import themes from '../../../../../styles/themes.json';
import Behavior from '../Behavior';
import Radio from 'backbone.radio';

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

    events() {
        return {
            'change @ui.theme': 'previewTheme',
        };
    }

    ui() {
        return {
            theme: '#theme',
        };
    }

    /**
     * Preview a theme.
     */
    previewTheme() {
        Radio.trigger('components/settings', 'changeTheme', {name: this.ui.theme.val()});
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
            themes,
            appLang    : (models.appLang || i18n.language) || 'en',
            theme      : models.theme || 'default',
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
