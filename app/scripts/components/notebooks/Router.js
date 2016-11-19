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
        const link = '(p/:profile/)';

        return {
            [`${link}notebooks`]          : 'showList',
            [`${link}notebooks/add`]      : 'notebookForm',
            [`${link}notebooks/edit/:id`] : 'notebookForm',
            [`${link}tags/add`]           : 'tagForm',
            [`${link}tags/edit/:id`]      : 'tagForm',
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
});
