/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'app',
    'helpers/uri',
    'enquire'
], function (_, $,  Marionette, App, URI, enquire) {
    'use strict';

    /**
     * Submodule which shows note content
     */
    var AppNote = App.module('AppNote', { startWithParent: false }),
        executeAction,
        API;

    AppNote.on('start', function () {
        App.mousetrap.API.restart();
        App.AppNavbar.start();

        App.log('AppNote is started');
    });

    AppNote.on('stop', function () {
        App.log('AppNote is stoped');
    });

    /**
     * The router
     */
    AppNote.Router = Marionette.AppRouter.extend({
        appRoutes: {
            'p/:profile'                    : 'showNotes',
            '(p/:profile/)notes/add'        : 'addNote',
            '(p/:profile/)notes/edit/:id'   : 'editNote',
            '(p/:profile/)notes/remove/:id' : 'removeNote',
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)'   : 'showNotes',
            '(p/:profile/)notes(/f/:filter)(/q/:query)(/p:page)(/show/:id)'  : 'showNote',
        }
    });

    /**
     * Start application
     */
    executeAction = function (action, args) {
        App.startSubApp('AppNote');
        action(args);
    };

    /**
     * Controller
     */
    API = {
        notesArg: null,

        getArgs: function (args) {
            var values = ['profile', 'filter', 'query', 'page', 'id'],
                argsObj = {};

            if (args.length === 1 && typeof args[0] === 'object') {
                return args[0];
            }

            _.each(values, function (value, index) {
                argsObj[value] = (args[index]) ? args[index] : null;
            });

            argsObj.page = Number(argsObj.page);
            argsObj.profile = argsObj.profile || URI.getProfile();
            return argsObj;
        },

        // Show list of notes
        showNotes: function () {
            var args = this.getArgs(arguments);

            require(['apps/notes/list/controller'], function (List) {
                API.notesArg = args;
                executeAction(new List().listNotes, args);
            });
        },

        // Show content of note
        showNote: function () {
            var args = this.getArgs(arguments);

            require(['apps/notes/show/showController'], function (Show) {
                App.trigger('notes:show', args);
                executeAction(new Show().showNote, args);
            });
        },

        // Add new note
        addNote: function (profile) {
            require(['apps/notes/form/controller'], function (Form) {
                executeAction(new Form().addForm, {profile: profile});
                API.notesWhileEditing(profile);
            });
        },

        // Edit an existing note
        editNote: function (profile, id) {
            require(['apps/notes/form/controller'], function (Form) {
                executeAction(new Form().editForm, {id : id, profile: profile});
                API.notesWhileEditing(profile);
            });
            App.log('edit note ' + id);
        },

        notesWhileEditing: function (profile) {
            if ( !API.notesArg ) {
                App.trigger('notes:show', {profile: profile});
            }
        },

        // Remove an existing note
        removeNote: function (profile, id) {
            require(['apps/notes/remove/removeController'], function (Controller) {
                executeAction(new Controller().remove, {id : id, profile: profile});
            });
        },

        // Re-render sidebar only if necessary
        checkShowSidebar: function (args) {
            var current = _.omit(API.notesArg || {}, 'id');
            API.notesArg = args;

            if ( !_.isEqual(current,  _.omit(args, 'id')) ) {
                API.showNotes(args);
            }
        }
    };

    /**
     * Router events
     */
    App.on('notes:list', function () {
        App.navigate(URI.link('/notes'), { trigger : true });
    });

    // Show sidebar with notes list only on big screen
    App.on('notes:show', function (args) {
        $(App.content.el).addClass('active-row');
        enquire.register('screen and (min-width:768px)', {
            match: function () {
                API.checkShowSidebar(args);
            },
            unmatch: function () {
                API.notesArg = args;
            }
        });
    });

    // Toggle to sidebar
    App.on('notes:toggle', function (args) {
        $(App.content.el).removeClass('active-row');
        API.checkShowSidebar(args);
    });

    // Re render
    App.on('notes:rerender', function () {
        API.showNotes(API.notesArg || {});
    });

    // Re-render sidebar if new note has been added
    App.on('notes:added', function (model) {
        API.showNotes(_.extend(API.notesArg || {}, {id: model.get('id')}));
    });

    // Show form
    AppNote.on('showForm', function () {
        App.navigate(URI.link('/notes/add'), true);
    });

    // Navigate to last note
    AppNote.on('navigate:back', function () {
        var url = URI.note(API.notesArg, API.notesArg);
        App.navigate(url, true);
    });

    // Re-render sidebar's and note's content after sync:after event
    App.on('sync:after', function () {

        // Re-render sidebar and note's content
        if ( App.currentApp.moduleName === 'AppNote' &&
           !App.getCurrentRoute().match(/\/[edit|add]+/) ) {

            var notesArg = _.extend(API.notesArg || {}, {
                profile : URI.getProfile()
            });

            API.showNotes(notesArg);
            if (notesArg.id) {
                API.showNote(notesArg);
            }
        }
    });

    /**
     * Register the router
     */
    App.addInitializer(function(){
        new AppNote.Router({
            controller: API
        });
    });

    return AppNote;
});
