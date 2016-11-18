/**
 * @module components/notebooks/list/views/Notebook
 */
import _ from 'underscore';
import ItemView from './ItemView';

/**
 * Notebook list item view.
 *
 * @class
 * @extends module:components/notebooks/list/views/ItemView
 * @license MPL-2.0
 */
export default class Notebook extends ItemView {

    get template() {
        const tmpl = require('../templates/notebook.html');
        return _.template(tmpl);
    }

    modelEvents() {
        return {
            change: 'render',
        };
    }

    templateContext() {
        return {
            getPadding() {
                if (this.level === 1) {
                    return '';
                }

                return `padding-left:${this.level * 20}px`;
            },
        };
    }

}
