/**
 * @module components/help/keybindings/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * View that shows keybinding help.
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

}
