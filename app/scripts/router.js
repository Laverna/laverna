/*global define */
define(['app', 'marionette', 'controllers/main'], function(App, Marionette, Controller){
    'use strict';

    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            ''                      :  'index',
            // Routes for notes     :
            'note/add'              :  'noteAdd',
            'note/:id'              :  'note',
            'note/edit/:id'         :  'noteEdit',
            'note/remove/:id'       :  'noteRemove',
            // Notebooks routes     :
            'notebook/add'          :  'notebookAdd',
            'notebook/edit/:id'     :  'notebookEdit',
            'notebook/remove/:id'   :  'notebookRemove',
            'notebook/:id'          :  'notebook'
        },

        controller: new Controller()
    });

    return Router;
});
