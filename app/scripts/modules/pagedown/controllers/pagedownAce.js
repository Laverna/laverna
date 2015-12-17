/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'q',
    'backbone.radio',
    'marionette',
    'modules/pagedown/libs/converter',
    'modules/pagedown/controllers/controller',
    'ace',
    'pagedown-ace/Markdown.Editor',
    'ace/mode/markdown',
    'ace/theme/github',
    'pagedown-extra'
], function(_, Q, Radio, Marionette, Converter, Controller, ace) {
    'use strict';

    /**
     * This class renders pagedown editor.
     *
     * It executes `editor:before` initializer before starting the editor.
     *
     * Triggers the following
     * Events:
     * 1. channel: editor, event: pagedown:scroll
     *    when a user scrolled through the editor.
     * 2. channel: editor, event: ready
     *    when pagedown is ready.
     *
     * Answers to the following
     * Replies:
     * 1. channel: editor, event: get:content
     *    returns current value from the editor.
     * 2. channel: editor, event: generate:link
     *    generates Markdown code for a link.
     * 3. channel: editor, event: generate:image
     *    generates Markdown code for an image.
     *
     * Replies:
     * 1. channel: editor, event: insert
     *    inserts text to the editor.
     */
    var PagedownAce = Controller.extend({

        initialize: function() {
            _.bindAll(this, 'initAce', 'startEditor');

            // Call parent initialize method
            _.bind(Controller.prototype.initialize, this)();

            return new Q(this.initMdEditor())
            .then(this.initAce)
            .then(this.startEditor)
            .fail(function(e) {
                console.error('Markdown editor: error', e);
            });
        },

        onDestroy: function() {
            this.editor.destroy();

            // Call parent onDestroy method
            _.bind(Controller.prototype.onDestroy, this)();
        },

        /**
         * Initialize ACE editor and configure it.
         * @return object
         */
        initAce: function() {
            // Initialize ACE editor
            this.editor = ace.edit('wmd-input');

            // Configure it
            this.editor.getSession().setMode('ace/mode/markdown');
            this.editor.setTheme('ace/theme/github');
            this.editor.setFontSize(14);

            // this.editor.setOption('spellcheck', true);
            this.editor.setHighlightActiveLine(true);
            this.editor.session.setUseWrapMode(true);
            this.editor.session.setUseSoftTabs(true);
            this.editor.session.setNewLineMode('unix');
            this.editor.setShowPrintMargin(false);

            this.editor.renderer.lineHeight = 20;
            this.editor.renderer.setPrintMarginColumn(false);
            this.editor.renderer.setShowGutter(false);

            // Events
            this.editor.session.on(
                'changeScrollTop',
                _.debounce(this.triggerScroll, 10, {maxWait: 10})
            );
            this.editor.session.on('change', this.onChange);

            return this.editor;
        },

        /**
         * Start Pagedown editor
         */
        startEditor: function() {
            // Run Ace
            this.mdEditor.run(this.editor);

            // Trigger an event
            this.vent.trigger('ready');

            this.changeMode();
            this.listenTo(Radio.channel('notesForm'), 'set:mode', this.changeMode);
        },

        /**
         * Change mode of the editor.
         */
        changeMode: function(mode) {
            mode = mode || this.configs.editMode;
            var options = {
                maxLines     : Infinity,
                minLines     : 40,
                marginTop    : 20,
                marginBottom : 100
            };

            // Infinite scroll in Normal mode
            if (mode === 'preview') {
                options.maxLines = null;
                options.minLines = 2;
            }
            else {
                options.marginTop = 4;
                options.marginBottom = 20;
            }

            this.editor.setOptions({
                maxLines: options.maxLines,
                minLines: options.minLines
            });

            // Margin: top bottom
            this.editor.renderer.setScrollMargin(options.marginTop, options.marginBottom);
            this.editor.renderer.setPadding(options.marginTop);
            this.editor.session.setScrollTop(1);

            // Update settings && resize
            this.editor.renderer.updateFull(true);
            this.editor.resize();
        },

        getContent: function() {
            var data     = {};
            data.content = !this.editor ? '' : this.editor.getSession().getValue().trim();
            data.tags    = Converter.getTags(data.content);
            data.files   = Radio.request('editor', 'get:files', data.content);
            data = _.extend(data, Converter.countTasks(data.content));
            return data;
        },

        focus: function() {
            this.editor.focus();
        },

        insertText: function(text) {
            this.editor.insert(text);
        }

    });

    return PagedownAce;

});
