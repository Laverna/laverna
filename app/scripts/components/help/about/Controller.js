/**
 * @module components/help/about/Controller
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import constants from '../../../constants';
import View from './View';

/**
 * Controller that shows information about the app.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    init() {
        this.show();
    }

    /**
     * Render the view.
     */
    show() {
        this.view = new View({
            constants,
        });

        Radio.request('Layout', 'show', {
            region : 'modal',
            view   : this.view,
        });

        // Destroy itself if the view is destroyed
        this.listenTo(this.view, 'destroy', this.destroy);
    }

}
