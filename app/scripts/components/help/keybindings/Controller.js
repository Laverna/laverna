/**
 * @module components/help/keybindings/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import View from './View';

import deb from 'debug';

const log = deb('lav:components/help/keybindings/Controller');

/**
 * Controller that shows keybinding help.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Fetch configs collection and render the view.
     *
     * @returns {Promise}
     */
    init() {
        return Radio.request('collections/Configs', 'find')
        .then(configs => this.show(configs))
        .catch(err => log('error', err));
    }

    /**
     * Render the view in modal region.
     *
     * @param {Object} configs - config collection
     */
    show(configs) {
        const collection = configs.clone();
        collection.reset(collection.keybindings());

        this.view = new View({
            collection,
        });

        Radio.request('Layout', 'show', {
            region : 'modal',
            view   : this.view,
        });

        // Destroy itself if the view destroyed
        this.listenTo(this.view, 'destroy', this.destroy);
    }

}
