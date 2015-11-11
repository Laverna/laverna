/* global define */
define([
    'underscore',
    'q',
    'backbone.radio',
    'marionette',
    'modules/pagedown/views/editor',
    'modules/pagedown/libs/converter',
    'ace',
    'pagedown-ace',
    'ace/mode/markdown',
    'ace/theme/github',
    'pagedown-extra'
], function(_, Q, Radio, Marionette, View, Converter, ace, Markdown) {
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
    var PagedownAce = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'onPreviewRefresh', 'triggerScroll', 'initAce', 'startEditor', 'onChange');

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

            return new Q(this.initMdEditor())
            .then(this.initAce)
            .then(this.startEditor)
            .fail(function(e) {
                console.error('Markdown editor: error', e);
            });
        },

        onDestroy: function() {
            this.stopListening();
            this.vent.stopReplying('get:content');
            this.editor.destroy();
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
         * Initialize ACE editor and configure it.
         * @return object
         */
        initAce: function() {
            // Initialize ACE editor
            this.editor = ace.edit('wmd-input');

            // Configure it
            this.editor.getSession().setMode('ace/mode/markdown');
            this.editor.setTheme('ace/theme/github');
            this.editor.setFontSize(16);

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

        onPreviewRefresh: function() {
            this.vent.trigger('preview:refresh');
        },

        onChange: function() {
            this.triggerSave();
        },

        triggerSave: _.debounce(function() {
            if (this.getContent() !== '') {
                Radio.trigger('notesForm', 'save:auto');
            }
        }, 1000),

        triggerScroll: function() {
            Radio.trigger('editor', 'pagedown:scroll');
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

        getLinkCode: function(data) {
            return '[' + data.text + ']' + '(' + data.url + ')';
        },

        getImageCode: function(data) {
            return '!' + this.getLinkCode(data);
        },

        insertText: function(text) {
            this.editor.insert(text);
        }

    });

    return PagedownAce;

});
