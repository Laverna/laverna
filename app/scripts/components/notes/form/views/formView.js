/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'mousetrap',
    'text!apps/notes/form/templates/form.html',
    'behaviors/content',
    'apps/notes/form/behaviors/desktop',
    'apps/notes/form/behaviors/mobile',
    'mousetrap.global'
], function($, _, Marionette, Radio, Mousetrap, Tmpl, Behavior, Desktop, Mobile) {
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
     *
     * Responds to the following
     * Requests:
     * 1. channel: notesForm, request: model
     *    returns current model.
     * 2. channel: notesForm, request: show:editor
     *    shows the provided view in the `editor` region.
     *
     * Listens to the following events:
     * 1. channel: notesForm, event: save:auto
     *    saves then the note automaticaly
     */
    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        className: 'layout--body',

        regions: {
            editor    : '#editor',
            notebooks : '#editor--notebooks'
        },

        behaviors: {
            Content: {
                behaviorClass: Behavior
            },
            Desktop: {
                behaviorClass: Desktop
            },
            Mobile: {
                behaviorClass: Mobile
            }
        },

        ui: {
            // Form
            form       : '.editor--form',
            saveBtn    :  '.editor--save',
            title      : '#editor--input--title'
        },

        events: {
            'click .editor--mode a' : 'switchMode',

            // Handle saving
            'submit @ui.form'      : 'save',
            'click @ui.saveBtn'    : 'save',
            'click .editor--cancel'  : 'cancel'
        },

        initialize: function() {
            _.bindAll(this, 'autoSave', 'save', 'cancel');

            this.configs = Radio.request('configs', 'get:object');
            this.$body = $('body');

            // Events and replies
            Radio.channel('notesForm')
            .reply('model', this.model, this)
            .reply('show:editor', this.showEditor, this)
            .on('save:auto', this.autoSave, this);

            // Register keybindings
            this.bindKeys();

            // The view is ready
            this.listenTo(this, 'rendered', this.onRendered);
            this.listenTo(this, 'bind:keys', this.bindKeys);
        },

        bindKeys: function() {
            Mousetrap.bindGlobal(['ctrl+s', 'command+s'], this.save);
            Mousetrap.bindGlobal(['esc'], this.cancel);
        },

        onRendered: function() {
            Radio.trigger('notesForm', 'view:ready');

            // Focus on the 'title'
            this.ui.title.trigger('focus');

            // Change edit mode
            if (this.configs.editMode !== 'normal') {
                this.switchMode(this.configs.editMode);
            }
        },

        onBeforeDestroy: function() {
            this._normalMode();

            // Trigger an event
            Radio.trigger('notesForm', 'view:destroy');

            // Stop listening to events
            Radio.channel('notesForm')
            .stopReplying('model show:editor')
            .off('save:auto');

            // Destroy shortcuts
            Mousetrap.unbind(['ctrl+s', 'command+s', 'esc']);
        },

        showEditor: function(view) {
            this.editor.show(view);
        },

        /**
         * Close the form without saving.
         */
        cancel: function() {
            // Save which element was under focus
            this.options.focus = this.ui.title.is(':focus') ? 'title' : 'editor';

            this.options.isClosed = true;
            this.options.redirect = true;

            this.trigger('cancel');
            return false;
        },

        autoSave: function() {
            if (this.options.isClosed) {
                return;
            }

			// Don't save tags when auto save notes
			// so that no unfinished tags are saved
			this.options.saveTags = false;

            this.options.redirect = false;
            console.log('Auto saving the note...');
            this.trigger('save');
        },

        save: function(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }

			this.options.saveTags = true;
            this.options.isClosed = true;
            this.options.redirect = true;
            this.trigger('save');

            return false;
        },

        switchMode: function(e) {
            var mode = (typeof e !== 'string' ? $(e.currentTarget).attr('data-mode') : e);
            if (!mode) {
                return;
            }

            // Close a dropdown menu
            this.ui.form.trigger('click');

            // Switch to another mode
            this['_' + mode + 'Mode'].apply(this);

            // Trigger an event
            Radio.trigger('notesForm', 'set:mode', mode);

            return false;
        },

        _fullscreenMode: function() {
            this.$body
            .removeClass('-preview')
            .addClass('editor--fullscreen');
        },

        _previewMode: function() {
            this.$body.addClass('editor--fullscreen -preview');
        },

        _normalMode: function() {
            this.$body.removeClass('editor--fullscreen -preview');
        }
    });

    return View;

});
