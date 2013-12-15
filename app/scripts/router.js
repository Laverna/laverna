/*global define */
define(['app', 'marionette', 'controllers/main'], function(App, Marionette, Controller){
    'use strict';

    var Router = Marionette.AppRouter.extend({
        appRoutes: {
            ''                                  :  'index',
            // Routes for notes                 :
            'note/add'                          :  'noteAdd',
            'note/edit/:id'                     :  'noteEdit',
            'note/remove/:id'                   :  'noteRemove',
            'note/show/:id'                     :  'noteShow',
            // Search                           :
            'note/search/:query/p:page'         :  'noteSearch',
            'note/search/:query/p:page/show/:id':  'noteSearch',
            // Favorite notes                   :
            'note/favorite/p:page'              :  'noteFavorite',
            'note/favorite/p:page/show/:id'     :  'noteFavorite',
            // Trashed notes                    :
            'note/trashed/p:page'               :  'noteTrashed',
            'note/trashed/p:page/show/:id'      :  'noteTrashed',
            // Tags notes                       :
            'note/tag/:tag/p:page'              :  'noteTag',
            'note/tag/:tag/p:page/show/:id'     :  'noteTag',
            // Notes with pagination            :
            'note/:notebook/p:page/show/:id'    :  'noteShow',
            'note/:notebook/p:page'             :  'index',
            // Notebooks routes                 :
            'notebooks'                         :  'notebooks',
            'notebook/add'                      :  'notebookAdd',
            'notebook/edit/:id'                 :  'notebookEdit',
            'notebook/remove/:id'               :  'notebookRemove',
            // Tags pages
            'tags/add'                          :  'tagAdd',
            'tags/edit/:id'                     :  'tagEdit',
            'tags/remove/:id'                   :  'tagRemove',
            'help'                              :  'help'
        },

        controller: new Controller()
    });

    return Router;
});
