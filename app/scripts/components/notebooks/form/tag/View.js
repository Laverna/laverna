/**
 * @module components/notebooks/form/tag/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import ModalForm from '../../../../behaviors/ModalForm';

/**
 * Tag form view.
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

    get className() {
        return 'modal fade';
    }

    ui() {
        return {
            name: 'input[name="name"]',
        };
    }

    /**
     * Behaviors.
     *
     * @see module:behavior/ModalForm
     * @returns {Array}
     */
    behaviors() {
        return [ModalForm];
    }

}
