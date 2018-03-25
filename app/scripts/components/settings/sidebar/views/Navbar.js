/**
 * @module components/settings/sidebar/Navbar
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * Settings navbar view for the sidebar.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Navbar extends Mn.View {

    get template() {
        const tmpl = require('../templates/navbar.html');
        return _.template(tmpl);
    }

}
