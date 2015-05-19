/* global define */
define([
    'underscore',
    'q',
    'jquery',
    'backbone.radio',
    'marionette',
    'apps/notes/form/views/formView',
    'apps/notes/form/views/notebooks'
], function (_, Q, $, Radio, Marionette, View, NotebooksView) {
    'use strict';

    /**
     * Note form controller.
     *
     * Triggers the following events:
     * 1. channel: notesForm, event: stop
     *
     * Listens to the following events:
     * 1. channel: notes, event: save:after
     *
     * Commands:
     * 1. channel: notes, command: save
     *    to save the changes.
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;

            _.bindAll(this, 'show', 'redirect');

            // Fetch everything
            Q.all([
                Radio.request('notes', 'get:model', options),
                Radio.request('notebooks', 'get:all', options)
            ])
            .spread(this.show);

            // Events
            this.listenTo(Radio.channel('notes'), 'save:after', this.redirect);
            this.listenTo(Radio.channel('Confirm'), 'confirm', this.redirect);
            this.listenTo(Radio.channel('Confirm'), 'cancel', this.onConfirmCancel);
        },

        onDestroy: function() {
            this.stopListening();
            this.view.trigger('destroy');
        },

        show: function(note, notebooks) {
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
            this.listenTo(this.view, 'save', this.save);
            this.listenTo(this.view, 'cancel', this.showConfirm);
        },

        save: function() {
            Radio.command('notes', 'save', this.view.model, this.getContent());
        },

        getContent: function() {
            return _.extend(Radio.request('editor', 'get:content'), {
                title      : this.view.ui.title.val().trim(),
                notebookId : this.view.notebooks.currentView.ui.notebookId.val().trim(),
            });
        },

        /**
         * Warn a user that they have made some changes.
         */
        showConfirm: function() {
            var data  = _.pick(this.getContent(), 'title', 'content', 'notebookId'),
                model = this.view.model.pick('title', 'content', 'notebookId');

            if (_.isEqual(model, data)) {
                return this.redirect();
            }

            Radio.command('Confirm', 'start', $.t('You have unsaved changes.'));
        },

        redirect: function() {
            if (!this.view.getOption('redirect')) {
                return;
            }

            // Stop the module and navigate back
            Radio.trigger('notesForm', 'stop');
            Radio.command('uri', 'back');
        },

        onConfirmCancel: function() {
            // Rebind keybindings again because TW bootstrap modal overrites ESC.
            this.view.trigger('bind:keys');
            this.view.options.isClosed = false;

            if (this.view.options.focus !== 'editor') {
                return this.view.ui[this.view.options.focus].focus();
            }
            Radio.trigger('editor', 'focus');
        }

    });

    return Controller;
});
