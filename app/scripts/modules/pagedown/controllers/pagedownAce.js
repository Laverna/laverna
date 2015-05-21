/* global define */
define([
    'underscore',
    'jquery',
    'backbone.radio',
    'marionette',
    'modules/pagedown/views/editor',
    'modules/pagedown/libs/converter',
    'ace',
    'pagedown-ace',
    'ace/mode/markdown',
    'ace/theme/github',
    'pagedown-extra'
], function(_, $, Radio, Marionette, View, Converter, ace, Markdown) {
    'use strict';

    /**
     * This class renders pagedown editor.
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
     */
    var PagedownAce = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'triggerScroll', 'onPreviewRefresh');
            this.configs = Radio.request('configs', 'get:object');

            // Initialize the view
            this.view = new View({
                model   : Radio.request('notesForm', 'model'),
                configs : this.configs
            });

            // Events
            Radio.channel('editor')
            .on('ready', this.changeConfigs, this)
            .on('focus', this.focus, this)
            .reply('get:content', this.getContent, this);

            Radio.on('notesForm', 'set:mode', this.changeConfigs, this);

            // Show the view and render Pagedown editor
            Radio.command('notesForm', 'show:editor', this.view);
            this.render();
        },

        onDestroy: function() {
            console.log('PagedownAce object is destroyed');
            Radio.off('notesForm', 'set:mode');

            Radio.channel('editor')
            .off('ready focus')
            .stopReplying('get:content');

            this.editor.destroy();
            this.view.trigger('destroy');
        },

        render: function() {
            // Initialize Markdown converter
            var converter = Converter.getConverter(),
                mdEditor;

            // Start the Markdown editor
            mdEditor = new Markdown.Editor(converter);

            // Configure ACE editor
            this.editor = ace.edit('wmd-input');
            this.editor.getSession().setMode('ace/mode/markdown');
            this.editor.setTheme('ace/theme/github');
            this.editor.setFontSize(16);

            // Ace configs
            // this.editor.setOption('spellcheck', true);
            this.editor.setHighlightActiveLine(true);
            this.editor.session.setUseWrapMode(true);
            this.editor.session.setUseSoftTabs(true);
            this.editor.session.setNewLineMode('unix');
            this.editor.setShowPrintMargin(false);

            this.editor.renderer.setPrintMarginColumn(false);
            this.editor.renderer.setShowGutter(false);

            // Run Ace
            mdEditor.run(this.editor);

            // Trigger an event
            Radio.trigger('editor', 'ready');

            // Listen to events
            mdEditor.hooks.chain('onPreviewRefresh', this.onPreviewRefresh);
            this.editor.session.on(
                'changeScrollTop',
                _.debounce(this.triggerScroll, 20, {maxWait: 20})
            );
        },

        onPreviewRefresh: function() {
            Radio.trigger('editor', 'preview:refresh');
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

        changeConfigs: function(mode) {
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
            data = _.extend(data, Converter.countTasks(data.content));
            return data;
        },

        focus: function() {
            this.editor.focus();
        }

    });

    return PagedownAce;

});
