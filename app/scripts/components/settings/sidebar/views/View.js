/**
 * @module components/settings/sidebar/View
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

/**
 * Settings sidebar view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('../templates/template.html');
        return _.template(tmpl);
    }

    events() {
        return {
            'click a': 'confirm',
        };
    }

    /**
     * After the view has rendered, activate a tab.
     */
    onRender() {
        this.activateTab(this.options);
    }

    /**
     * Activate a tab.
     *
     * @param {Object} data
     * @param {String} data.tab
     */
    activateTab(data) {
        this.$('.active').removeClass('active');
        this.$(`[href*=${data.tab}]`).addClass('active');
    }

    /**
     * Before navigating to another page, check if there are any unsaved changes.
     *
     * @param {Object} e
     */
    confirm(e) {
        e.preventDefault();

        Radio.trigger('components/settings', 'navigate', {
            url: this.$(e.currentTarget).attr('href'),
        });
    }

    serializeData() {
        return this.options;
    }

}
