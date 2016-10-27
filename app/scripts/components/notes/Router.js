/**
 * @module components/Notes/Router
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import controller from './controller';

/**
 * Notes router.
 *
 * @class
 * @extends Marionette.AppRouter
 * @license MPL-2.0
 */
export default class Router extends Mn.AppRouter {

    /**
     * Controller.
     *
     * @see module:components/Notes/controller
     * @returns {Object}
     */
    get controller() {
        return controller;
    }

    /**
     * appRoutes.
     *
     * @returns {Object}
     */
    get appRoutes() {
        const filter = '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)';

        return {
            ''           : 'showNotes',
            'p/:profile' : 'showNotes',

            // Show notes list
            [`${filter}`]          : 'showNotes',
            [`${filter}/show/:id`] : 'showNote',

            // Edit/add notes
            '(p/:profile/)notes/add'      : 'showForm',
            '(p/:profile/)notes/edit/:id' : 'showForm',
        };
    }

}

// Instantiate the router automatically
Radio.once('App', 'init', () => new Router());
