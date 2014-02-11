/*global define*/
/*global Markdown*/
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'text!apps/notes/form/templates/form.html',
    'checklist',
    'tags',
    'ace',
    'to-markdown',
    'marionette',
    'ace/mode/markdown',
    'ace/theme/github',
    'pagedown-extra'
],
function (_, $, App, Backbone, Template, Checklist, Tags, ace, toMarkdown) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      :  'input[name="title"]',
            content    :  '.wmd-input',
            clipContent :  '#clipContent',
            tags       :  'select[name="tags"]',
            notebookId :  '[name="notebookId"]',
            sCont      :  '.ui-s-content',
            // Mode stuff
            form       :  '#noteForm',
            wmdBar     :  '#wmd-button-bar',
        },

        events: {
            'submit #noteForm' : 'save',
            'blur #inputTitle' : 'noteClipped',
            'click .modeMenu a': 'switchMode',
            'click .saveBtn'   : 'save',
            'click .cancelBtn' : 'redirect',
            'keyup input[name=title]'  : 'keyupEvents'
        },

        initialize: function () {
            _.bindAll(this, 'scrollPagedownBar');
            App.mousetrap.API.pause();
            this.$body = $('body');

            this.on('shown', this.pagedownRender);
            this.on('shown', this.changeMode);
        },

        onClose: function () {
            App.mousetrap.API.unpause();
            this.switchMode();
        },

        onRender: function() {
            // Pagedown bar always visible
            this.ui.sCont.on('scroll', this.scrollPagedownBar);
        },

        changeMode: function () {
            if (App.settings.editMode !== 'normal') {
                this.$('.modeMenu a[data-mode="' + App.settings.editMode + '"]').trigger('click');
            }
        },

        /**
         * When content is clipped
         */
        noteClipped: function () {
            if (this.ui.clipContent.val() === '') {
                return;
            }
            this.editor.setValue(this.ui.clipContent.val());
        },

        /**
         * Save note to storage
         */
        save: function (e) {
            e.preventDefault();

            var content = this.editor.getSession().getValue().trim(),
                title   = this.ui.title.val().trim(),
                data;

            // Get values
            data = {
                title      : (title !== '') ? title : 'Unnamed',
                content    : this.toMarkdown(_.unescape(content)),
                notebookId : parseInt(this.ui.notebookId.val())
            };

            // Tasks
            var checklist = new Checklist().count(data.content);
            data.taskAll = checklist.all;
            data.taskCompleted = checklist.completed;

            // Tags
            data.tags = new Tags().getTags(data.content);

            // Trigger save
            this.model.trigger('save', data);
        },

        /**
         * Redirect to note
         */
        redirect: function (e) {
            e.preventDefault();
            return this.trigger('redirect');
        },

        /**
         * Convert html to markdown and clean text
         */
        toMarkdown: function (text) {
            var toMark = new toMarkdown.converter();
            text = toMark.makeMd(this.editor.getSession().getValue());
            return $('<p>' + text + '</p>').text();
        },

        /**
         * Pagedown-ace editor
         */
        pagedownRender: function () {
            var converter,
                self = this,
                editor;

            converter = new Markdown.Converter();
            Markdown.Extra.init(converter);

            // Customize markdown converter
            converter.hooks.chain('postNormalization', function (text) {
                text = new Checklist().toHtml(text);
                return new Tags().toHtml(text);
            });

            // XSS free preview
            converter.hooks.chain('preConversion', function (text) {
                return self.toMarkdown(text);
            });

            // Initialize pagedown
            editor = new Markdown.Editor(converter);

            // ACE
            this.editor = ace.edit('wmd-input');
            this.editor.getSession().setMode('ace/mode/markdown');
            this.editor.setTheme('ace/theme/github');
            this.editor.setFontSize(16);

            // Ace configs
            // this.editor.setOption('spellcheck', true);
            this.editor.setHighlightActiveLine(true);
            this.editor.renderer.setShowGutter(false);
            this.editor.session.setUseWrapMode(true);
            this.editor.session.setUseSoftTabs(true);
            this.editor.session.setNewLineMode('unix');
            this.editor.renderer.setPrintMarginColumn(false);
            this.editor.setShowPrintMargin(false);

            // Auto expand: http://stackoverflow.com/questions/11584061/automatically-adjust-height-to-contents-in-ace-cloud9-editor
            this.editor.setOptions({
                maxLines: Infinity,
                minLines: 40
            });

            // this.editor.setKeyboardHandler('vim'); // vim
            editor.run(this.editor);

            // Hide default buttons
            this.$('.wmd-button-row li').addClass('btn').css('left', 0);
            this.$('.wmd-button-row').addClass('btn-group');

            // Save button
            this.$('.wmd-button-row').append(this.$('.saveBtn').clone().addClass('wmd-save-button'));

            // Dropdown menu for changing modes
            this.$('.wmd-button-row').prepend(this.$('.switch-mode').clone().addClass('wmd-mode-button'));

            // Focus to input[title]
            this.ui.title.focus();
        },

        /**
         * WMD bar always follows you
         */
        scrollPagedownBar: function (e) {
            // Not in distraction free mode
            if ( !e || this.ui.wmdBar.hasClass('navbar-fixed-top')) {
                this.ui.wmdBar.removeClass('wmd-bar-fixed');
                this.ui.wmdBar.css({top: 0});
                return;
            }
            var scroll = $(e.target).scrollTop();
            if (scroll >= 260) {
                this.ui.wmdBar.addClass('wmd-bar-fixed')
                    .css({top: scroll-2 + 'px'});
            } else {
                this.ui.wmdBar.removeClass('wmd-bar-fixed');
            }
        },

        /**
         * Close page when user hits ESC in inputs
         */
        keyupEvents: function (e) {
            switch (e.which) {
                // Close form when user hits Esc
                case 27:
                    this.redirect(e);
                    break;
                default:
                    break;
            }
        },

        /**
         * Switch edit mode
         */
        switchMode: function (e) {
            var mode;
            if (e !== undefined) {
                mode = $(e.target).attr('data-mode');
                this.$body.hide();
                // Fix Pagedown bugs
                this.scrollPagedownBar();
                this.editor.resize();
            }
            switch (mode) {
                case 'fullscreen':
                    this.distractionFreeMode();
                    break;
                case 'preview':
                    this.previewMode();
                    break;
                default:
                    this.normalMode();
                    break;
            }
            if (mode) {
                this.$body.fadeIn('slowly');
            }
            this.$('.wmd-mode-button').removeClass('open');
            return false;
        },

        /**
         * Edit text in distraction free mode
         */
        distractionFreeMode: function () {
            this.normalMode();  // Reset everything
            this.$body.addClass('distraction-free');
            this.ui.wmdBar.addClass('navbar navbar-fixed-top');
        },

        /**
         * Edit text with preview
         */
        previewMode: function () {
            this.$body.addClass('distraction-free two-column');
            this.ui.wmdBar.addClass('navbar navbar-fixed-top');
        },

        /**
         * Edit text in normal mode
         */
        normalMode: function () {
            this.$body.removeClass('distraction-free two-column');
            this.ui.wmdBar.removeClass('navbar navbar-fixed-top');
        },

        serializeData: function () {
            var data = _.extend(this.model.toJSON(), this.options.decrypted);
            data.content = _.escape(data.content);
            data.notebooks = this.options.notebooks.decrypt();
            return data;
        },

        templateHelpers: function() {
            return {
                isActive: function (id, notebookId) {
                    var selected = '';
                    if (notebookId && id === notebookId) {
                        selected = ' selected="selected"';
                    }
                    return selected;
                }
            };
        }

    });

    return View;
});
