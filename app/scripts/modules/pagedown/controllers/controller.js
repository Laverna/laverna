/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, Markdown */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'modules/pagedown/libs/converter',
    'modules/pagedown/views/editor',
], function(_, Marionette, Radio, Converter, View) {
    'use strict';

    /**
     * Basic controller from which both PagedownAce and Pagedown extend.
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'onPreviewRefresh', 'triggerScroll', 'onChange');

            // Get configs
            this.configs = Radio.request('configs', 'get:object');

            // Initialize the view
            this.view = new View({
                model   : Radio.request('notesForm', 'model'),
                configs : this.configs
            });

            // Show the view and render Pagedown editor
            Radio.request('notesForm', 'show:editor', this.view);

            // Listen to events
            this.vent = Radio.channel('editor');
            this.listenTo(this.vent, 'focus', this.focus);

            // Replies
            this.vent.reply('get:content', this.getContent, this);
            this.vent.reply('generate:link', this.getLinkCode, this);
            this.vent.reply('generate:image', this.getImageCode, this);

            // Replies
            this.vent.reply('insert', this.insertText, this);
        },

        onDestroy: function() {
            this.stopListening();
            this.vent.stopReplying('get:content');
            this.view.trigger('destroy');
        },

        /**
         * Initialize Pagedown editor.
         * @return promise
         */
        initMdEditor: function() {
            var converter = Converter.getConverter(this.view.model);

            // Start the Markdown editor
            this.mdEditor = new Markdown.Editor(converter);

            // Register hooks
            this.mdEditor.hooks.chain('onPreviewRefresh', this.onPreviewRefresh);

            // Start initializers
            return Radio.request('init', 'start', 'editor:before', this.mdEditor, this.view.model)();
        },

        /**
         * Trigger `preview:refresh` when preview is refreshed.
         */
        onPreviewRefresh: function() {
            this.vent.trigger('preview:refresh');
        },

        onChange: function() {
            this.triggerSave();
        },

        /**
         * Trigger auto:save.
         */
        triggerSave: _.debounce(function() {
            if (this.getContent() !== '') {
                Radio.trigger('notesForm', 'save:auto');
            }
        }, 1000),

        triggerScroll: function() {
            Radio.trigger('editor', 'pagedown:scroll');
        },

        getLinkCode: function(data) {
            return '[' + data.text + ']' + '(' + data.url + ')';
        },

        getImageCode: function(data) {
            return '!' + this.getLinkCode(data);
        },

    });

    return Controller;
});
