/**
 * @module components/fuzzySearch/views/Child
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * Fuzzy search child view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Child extends Mn.View {

    get template() {
        const tmpl = require('../template.html');
        return _.template(tmpl);
    }

    get className() {
        return 'list-group list--group';
    }

    triggers() {
        return {
            'click .list-group-item': 'navigate:search',
        };
    }

}
