/**
 * @module components/settings/Router
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import controller from './controller';

/**
 * Settings router.
 *
 * @class
 * @extends Marionette.AppRouter
 * @license MPL-2.0
 */
export default class Router extends Mn.AppRouter {

    /**
     * Controller.
     *
     * @see module:components/settings/controller
     * @prop {Object}
     */
    get controller() {
        return controller;
    }

    /**
     * appRoutes
     *
     * @prop {Object}
     */
    get appRoutes() {
        return {
            'settings(/:tab)' : 'showContent',
        };
    }

}

// Instantiate the router automatically
Radio.once('App', 'init', () => new Router());
