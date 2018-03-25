/**
 * @module components/notebooks/list/views/Tag
 */
import _ from 'underscore';
import ItemView from './ItemView';

/**
 * Tag list item view.
 *
 * @class
 * @extends module:components/notebooks/list/views/ItemView
 * @license MPL-2.0
 */
export default class Tag extends ItemView {

    get template() {
        const tmpl = require('../templates/tag.html');
        return _.template(tmpl);
    }

}
