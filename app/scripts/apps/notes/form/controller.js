/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette',
    'apps/notes/form/views/formView',
    'apps/notes/form/views/notebooks'
], function (_, $, Radio, Marionette, View, NotebooksView) {
    'use strict';

    /**
     * Note form controller.
     *
     * Triggers the following events:
     * 1. channel: notesForm, event: stop
     *
     * Listens to the following events:
     * 1. channel: notes, event: save:after
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;

            _.bindAll(this, '_show', '_redirect');

            // Fetch everything
            $.when(
                Radio.request('notes', 'get:model', options.id),
                Radio.request('notebooks', 'get:all')
            )
            .then(this._show);

            // Events
            Radio.on('notes', 'save:after', this._redirect);
        },

        onDestroy: function() {
            Radio.off('notes', 'save:after');
            this.view.trigger('destroy');
        },

        _show: function(note, notebooks) {
            var notebooksView;

            this.view = new View({
                model     : note,
                profile   : note.database.id,
                files     : []
            });

            // Show the view and trigger an event
            Radio.command('global', 'region:show', 'content', this.view);
            this.view.trigger('rendered');

            // Show notebooks selector
            notebooksView = new NotebooksView({
                collection : notebooks,
                activeId   : note.get('notebookId')
            });
            this.view.notebooks.show(notebooksView);

            // Listen to view events
            this.listenTo(this.view, 'cancel', this._redirect);
        },

        _redirect: function() {
            if (!this.view.getOption('redirect')) {
                return;
            }

            // Stop the module and navigate back
            Radio.trigger('notesForm', 'stop');
            Radio.command('uri', 'back');
        }

    });

    return Controller;
});
