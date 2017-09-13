/**
 * @module components/setup/export/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * Export the generated key.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Export extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    ui() {
        return {
            sync: '[name=sync]',
        };
    }

    className() {
        return 'row';
    }

    serializeData() {
        return this.options;
    }

}
