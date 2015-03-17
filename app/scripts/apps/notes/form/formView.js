/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'Mousetrap',
    'text!apps/notes/form/templates/form.html',
    'mousetrap-global'
], function($, _, Marionette, Radio, Mousetrap, Tmpl) {
    'use strict';

    /**
     * Note form view.
     *
     * Triggers the following
     * Events:
     * 1. channel: notesForm, event: view:ready
     *    when the view is ready.
     * 2. channel: notesForm, event: view:destroy
     *    before the view is destroyed.
     * 3. channel: notesForm, event: set:mode
     *    when "Edit mode" has changed.
     * Commands:
     * 1. channel: notes, event: save
     *    to save the changes.
     *
     * Responds to the following
     * Requests:
     * 1. channel: notesForm, request: model
     *    returns current model.
     * Commands
     * 1. channel: notesForm, command: show:editor
     *    shows the provided view in the `editor` region.
     *
     * Listens to the following events:
     * 1. channel: notesForm, event: save:auto
     *    saves then the note automaticaly
     */
    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        regions: {
            editor: '#editor'
        },

        ui: {
            mode       : '.switch-mode',

            // Form
            form       : '#noteForm',
            saveBtn    :  '.saveBtn',

            // Note content
            title      : 'input[name="title"]',
            content    : '.wmd-input',
            notebookId : '[name="notebookId"]',
        },

        events: {
            'click .modeMenu a' : 'switchMode',

            // Handle saving
            'submit @ui.form'   : 'save',
            'click @ui.saveBtn' : 'save',
            'click .cancelBtn'  : 'cancel',
        },

        serializeData: function() {
            var data = this.model.toJSON();
            data.notebooks = this.options.notebooks.decrypt();
            return data;
        },

        initialize: function() {
            _.bindAll(this, 'autoSave', 'save', 'cancel');

            this.configs = Radio.request('global', 'configs');
            this.$body = $('body');

            // Events, complies, and replies
            Radio.channel('notesForm')
            .reply('model', this.model, this)
            .comply('show:editor', this.showEditor, this)
            .on('save:auto', this.autoSave, this);

            // Shortcuts
            Mousetrap.bindGlobal(['ctrl+s', 'command+s'], this.save);
            Mousetrap.bindGlobal(['esc'], this.cancel);

            // The view is ready
            this.on('rendered', this.onRendered, this);
        },

        onRendered: function() {
            Radio.trigger('notesForm', 'view:ready');

            // Focus on the 'title'
            this.ui.title.trigger('focus');

            // Change edit mode
            if (this.configs.editMode !== 'normal') {
                this.$('.modeMenu a[data-mode="' + this.configs.editMode + '"]')
                    .trigger('click');
            }
        },

        onBeforeDestroy: function() {
            this._normalMode();

            // Trigger an event
            Radio.trigger('notesForm', 'view:destroy');

            // Stop listening to events
            Radio.channel('notesForm')
            .stopReplying('model')
            .stopComplying('show:editor')
            .off('save:auto');

            // Destroy shortcuts
            Mousetrap.unbind(['ctrl+s', 'command+s', 'esc']);

            console.log('view was destroyed');
        },

        showEditor: function(view) {
            this.editor.show(view);
        },

        /**
         * Close the form without saving.
         * @TODO ask for user's approval
         */
        cancel: function() {
            this.options.redirect = true;
            this.trigger('cancel');
            return false;
        },

        autoSave: function() {
            this.options.redirect = false;
            console.log('Auto saving the note...');
            this._save();
        },

        save: function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }

            this.options.redirect = true;
            this._save();

            return false;
        },

        switchMode: function(e) {
            var mode = $(e.currentTarget).attr('data-mode');
            if (!mode) {
                return;
            }

            // Close a dropdown menu
            this.ui.mode.trigger('click');

            // Switch to another mode
            this['_' + mode + 'Mode'].apply(this);

            // Trigger an event
            Radio.trigger('notesForm', 'set:mode', mode);

            return false;
        },

        _save: function() {
            var data = {
                title      : this.ui.title.val().trim(),
                content    : Radio.request('editor', 'get:content'),
                notebookId : this.ui.notebookId.val().trim(),
            };
            Radio.command('notes', 'save', this.model, data);
        },

        _fullscreenMode: function() {
            this.$body
            .removeClass('two-column')
            .addClass('distraction-free');
        },

        _previewMode: function() {
            this.$body.addClass('distraction-free two-column');
        },

        _normalMode: function() {
            this.$body.removeClass('distraction-free two-column');
        }
    });

    return View;

});
