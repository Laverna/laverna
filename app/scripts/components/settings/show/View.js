/**
 * @module components/settings/show/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Content from '../../../behaviors/Content';

/**
 * Settings layout view.
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
     * @see module:behaviors/Content
     * @returns {Array}
     */
    get behaviors() {
        return [Content];
    }

    regions() {
        return {
            content: '.settings--content',
        };
    }

    ui() {
        return {
            save: '.settings--save',
        };
    }

    events() {
        return {
            'click @ui.save': 'save',
        };
    }

    triggers() {
        return {
            'click .settings--cancel' : 'cancel',
        };
    }

    /**
     * Show a tab view.
     */
    onRender() {
        this.tabView = new this.options.TabView(this.options);
        this.showChildView('content', this.tabView);
    }

    /**
     * Trigger "save" event.
     *
     * @param {Object} e
     */
    save(e) {
        e.preventDefault();
        const view = this.getChildView('content');

        /*
         * If the password was autofilled by a user's browser, it usually
         * does not trigger `change` event. This will fix it.
         */
        if (view.ui && view.ui.password) {
            view.ui.password.trigger('change');
        }

        this.ui.save.attr('disabled', true);
        this.trigger('save');
    }

    /**
     * Remove "disabled" attribute from "save" button.
     */
    onSaved() {
        this.ui.save.removeAttr('disabled');
    }

    /**
     * Return options.
     *
     * @returns {Object}
     */
    serializeData() {
        return this.options;
    }

}
