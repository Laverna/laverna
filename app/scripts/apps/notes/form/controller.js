/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'underscore',
    'q',
    'jquery',
    'backbone.radio',
    'marionette',
    'i18next',
    'apps/notes/form/views/formView',
    'apps/notes/form/views/notebooks'
], function (_, Q, $, Radio, Marionette, i18n, View, NotebooksView) {
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
     * requests:
     * 1. channel: notes, request: save
     *    to save the changes.
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;

            // Saves data before you change anything, in case you cancel editing
            this.dataBeforeChange = null;
            // Data should be deleted if user wants to cancel editing
            this.deleteData = false;

            _.bindAll(this, 'show', 'redirect');

            // Fetch everything
            Q.all([
                Radio.request('notes', 'get:model:full', options),
                Radio.request('notebooks', 'get:all', _.pick(options, 'profile'))
            ])
            .spread(this.show)
            .catch(function() {
                console.error('Editor error', arguments);
            });

            // Events
            this.listenTo(Radio.channel('notes'), 'update:model', this.redirect);
            this.listenTo(Radio.channel('Confirm'), 'confirm', this.redirect);
            this.listenTo(Radio.channel('Confirm'), 'cancel', this.onConfirmCancel);
        },

        onDestroy: function() {
            this.stopListening();
            this.view.trigger('destroy');
        },

        show: function(note, notebooks) {
            var notebooksView;
            note = note[0];

            // Set document title
            Radio.request('global', 'set:title', note.get('title'));

            // Use behaviours that are appropriate for a device.
            if (Radio.request('global', 'platform') === 'mobile') {
                delete View.prototype.behaviors.Desktop;
            }
            else {
                delete View.prototype.behaviors.Mobile;
            }

            this.view = new View({
                model     : note,
                profile   : note.profileId
            });

            // Show the view and trigger an event
            Radio.request('global', 'region:show', 'content', this.view);
            this.view.trigger('rendered');

            /*
             * Resolve the notebook ID.
             * If the current note doesn't have a notebook attached,
             * try to use one from the filter if it specifies a notebook.
             */
            var activeId = note.get('notebookId');
            if (activeId === '0' && this.options.filter === 'notebook') {
                activeId = this.options.query;
            }

            // Show notebooks selector
            notebooksView = new NotebooksView({
                collection : notebooks,
                activeId   : activeId
            });
            this.view.notebooks.show(notebooksView);

            // Listen to view events
            this.listenTo(this.view, 'save', this.save);
            this.listenTo(this.view, 'cancel', this.showConfirm);

            // Get data before any change is made
            // so that it can be reset when you cancel editing
            var self = this;
            this.getContent()
            .then(function(data) {
                self.dataBeforeChange = data;
            })
            .fail(function(e) {
                console.error('Error getting data on start', e);
            });
        },

        save: function() {
            var self = this;

            return this.getContent()
            .then(function(data) {
                if (data.title === '') {
                    var title = i18n.t('Untitled');
                    data.title = title;
                    Radio.request('global', 'set:title', title);
                }

                return Radio.request('notes', 'save', self.view.model, data, self.view.options.saveTags);
            })
            .fail(function(e) {
                console.error('Error', e);
            });
        },

        getContent: function() {
            var self = this;

            return Radio.request('editor', 'get:data')
            .then(function(data) {
                return _.extend(data, {
                    title      : self.view.ui.title.val().trim(),
                    notebookId : self.view.notebooks.currentView.ui.notebookId.val().trim(),
                });
            });
        },

        /**
         * Warn a user that they have made some changes.
         */
        showConfirm: function() {
            var self = this;

            return this.getContent()
            .then(function(data) {
                // Redirect if data wasn't changed
                if (_.isEqual(self.dataBeforeChange, data)) {
                    return self.redirect();
                }

                // User perhaps wants to cancel editing,
                // if not, deleteData will be set false again in onConfirmCancel
                self.deleteData = true;
                Radio.request('Confirm', 'start', $.t('You have unsaved changes'));
            })
            .fail(function(e) {
                console.error('form ShowConfirm', e);
            });
        },

        // Called when the cancel dialog was accepted
        redirect: function() {
            if (!this.view.getOption('redirect')) {
                return;
            }

            // Stop the module and navigate back
            if(this.deleteData){
                this.deleteData = false;
                if (this.options.method === 'add') {
                    // Delete the note if editing of a new note was canceled
                    var self = this;
                    requirejs(['apps/notes/remove/controller'], function(Controller) {
                        new Controller(_.extend({},
                                {id: self.view.model.id, deleteDirect: true}));
                    });
                }
                else if (this.options.method === 'edit') {
                    // Save the note without any change
                    // if editing of an existing note was canceled
                    Radio.request('notes', 'save', this.view.model, this.dataBeforeChange);
                }
            }

            Radio.trigger('notesForm', 'stop');
            Radio.request('uri', 'back');
        },

        // Called when the cancel dialog was canceled
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
