/**
 * @module components/dropbox/show/settings/View
 */
import _ from 'underscore';
import Mn from 'backbone.marionette';
import constants from '../../../constants';

/**
 * Show a list of users whom you trust or invited.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Users extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    get dropboxKeyNeed() {
        return constants.dropboxKeyNeed;
    }

    serializeData() {
        return {
            dropboxKey  : this.collection.get('dropboxKey').get('value'),
            placeholder : this.dropboxKeyNeed ? 'Required' : 'Optional',
        };
    }

}
