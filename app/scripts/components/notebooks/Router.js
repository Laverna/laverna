/**
 * @module components/notebooks/Router
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';

import controller from './controller';

/**
 * Notebooks router.
 *
 * @class
 * @extends Marionette.AppRouter
 * @license MPL-2.0
 */
export default class Router extends Mn.AppRouter {

    /**
     * Controller.
     *
     * @see module:components/Notebooks/controller
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
        return {
            notebooks            : 'showList',
            'notebooks/add'      : 'notebookForm',
            'notebooks/edit/:id' : 'notebookForm',
            'tags/add'           : 'tagForm',
            'tags/edit/:id'      : 'tagForm',
        };
    }

}

Radio.once('App', 'init', () => {
    // Instantiate the router
    new Router();

    // Start replying to "notebookForm" request
    Radio.reply('components/notebooks', 'notebookForm', opt => {
        return controller.notebookFormReply(opt);
    });
    
    // Start replying to "tagForm" request
    Radio.reply('components/notebooks', 'tagForm', opt => {
        return controller.tagFormReply(opt);
    });
});
