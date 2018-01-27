/**
 * @module components/electronSearch/Controller
 */
import Mn from 'backbone.marionette';
import Mousetrap from 'mousetrap';
import Radio from 'backbone.radio';
import View from './View';
import deb from 'debug';

const log = deb('lav:components/electronSearch/Controller');

/**
 * Electron search controller.
 *
 * @class
 * @extends Marionette.Object
 * @license MPL-2.0
 */
export default class Controller extends Mn.Object {

    /**
     * Region name where the view will be rendered.
     *
     * @prop {String}
     */
    get region() {
        return 'module--electronSearch';
    }

    constructor(...args) {
        super(...args);

        // Create a new region
        Radio.request('Layout', 'add', {
            region : this.region,
            html   : true,
        });

        // Show the view if a keyboard shortcut is pressed
        Mousetrap.bind(['ctrl+f', 'command+f'], e => this.init(e));
        log('ready');
    }

    /**
     * Render the view.
     *
     * @param {Object} e
     */
    init(e) {
        e.preventDefault();

        this.view = new View();
        Radio.request('Layout', 'show', {
            region : this.region,
            view   : this.view,
        });
        this.view.triggerMethod('ready');
    }

}

// Instantiate the controller on start only if the app is in electron environment
Radio.once('App', 'start', () => {
    if (window.electron) {
        new Controller();
    }
});
