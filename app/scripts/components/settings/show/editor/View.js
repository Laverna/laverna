/**
 * @module components/settings/show/editor/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Behavior from '../Behavior';

/**
 * Editor settings view.
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

    ui() {
        return {
            indentUnit    : '#indentUnit',
            indentWarning : '#indentUnit-low-warning',
        };
    }

    events() {
        return {
            'change @ui.indentUnit' : 'checkIndentUnit',
        };
    }

    /**
     * Show indentation warning if its value is lower than 3.
     */
    checkIndentUnit() {
        const indent = Number(this.ui.indentUnit.val().trim());
        this.ui.indentWarning.toggleClass('hidden', indent >= 3);
    }

    serializeData() {
        return {
            models: this.collection.getConfigs(),
        };
    }

}
