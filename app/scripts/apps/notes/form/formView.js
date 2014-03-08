/*global define*/
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'text!apps/notes/form/templates/form.html',
    'checklist',
    'tags',
    'ace',
    'marionette',
    'ace/mode/markdown',
    'ace/theme/github',
    'pagedown-extra'
],
function (_, $, App, Backbone, Template, Checklist, Tags, ace) {
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

            // Pagedown editor
            this.on('shown', this.pagedownRender);
            this.on('shown', this.changeMode);
            this.on('pagedown:ready', this.onPagedownReady);
            this.on('pagedown:ready', this.changePagedownMode);
            this.on('pagedown:mode',  this.changePagedownMode);
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

            var title   = this.ui.title.val().trim(),
                content,
                data;

            if (this.editor) {
                content = this.editor.getSession().getValue().trim();
            } else {
                content = this.$('#wmd-input').val();
            }

            // Get values
            data = {
                title      : (title !== '') ? title : 'Unnamed',
                content    : _.unescape(content),
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

        onPagedownReady: function () {
            var $wmdButton = this.$('.wmd-button-row');

            // Hide default buttons
            this.$('.wmd-button-row li').addClass('btn').css('left', 0);
            $wmdButton.addClass('btn-group');

            // Save & cancel buttons
            $wmdButton.append(this.$('.saveBtn').clone().addClass('wmd-save-button wmd-hidden'));
            $wmdButton.append(this.$('.cancelBtn').clone().addClass('wmd-cancel-button wmd-hidden'));

            // Dropdown menu for changing modes
            $wmdButton.prepend(this.$('.switch-mode').clone().addClass('wmd-mode-button wmd-hidden'));

            // Focus to input[title]
            this.ui.title.focus();
        },

        /**
         * Render pagedown
         */
        pagedownRender: function () {
            var pagedown = (document.body.clientWidth < 768) ? 'pagedown' : 'pagedown-ace',
                self = this,
                converter,
                editor;

            require([pagedown], function (Markdown) {
                converter = new Markdown.Converter();
                Markdown.Extra.init(converter);

                // Customize markdown converter
                converter.hooks.chain('postNormalization', function (text) {
                    text = new Checklist().toHtml(text);
                    return new Tags().toHtml(text);
                });

                // Initialize pagedown
                editor = new Markdown.Editor(converter);

                // Pagedown with textarea
                if (pagedown === 'pagedown') {
                    self.$('#wmd-input').replaceWith(function () {
                        return $('<textarea id="wmd-input">').addClass(this.className);
                    });
                    self.$('#wmd-input').val(self.model.get('content'));
                    self.$('#wmd-input').on('scroll', function () {
                        self.syncScrollTop($(this).scrollTop());
                    });
                    editor.run();
                }
                // Pagedown with ace editor
                else {
                    _.bindAll(self, 'aceRender');
                    self.aceRender(editor);
                }

                self.trigger('pagedown:ready');
            });
        },

        /**
         * Pagedown-ace editor
         */
        aceRender: function (editor) {
            // ACE
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

            // this.editor.setKeyboardHandler('vim'); // vim
            editor.run(this.editor);
        },

        /**
         * Individual pagedown settings for preview mode and default
         */
        changePagedownMode: function (mode) {
            if ( !this.editor) {
                return;
            }

            mode = mode || App.settings.editMode;
            var options = {
                maxLines     : Infinity,
                minLines     : 40,
                marginTop    : 20,
                marginBottom : 100
            },
            self = this;

            if (mode === 'preview') {
                // Editor with scrolls again
                this.$('#wmd-input').css('height', 'auto');
                options.maxLines = null;
                options.minLines = 2;
            }
            else {
                options.marginTop = 4;
                options.marginBottom = 20;
            }

            // Auto expand: http://stackoverflow.com/questions/11584061/automatically-adjust-height-to-contents-in-ace-cloud9-editor
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

            // Sync scrollTop
            this.editor.session.on('changeScrollTop', function () {
                self.syncScrollTop(self.editor.renderer.getScrollTop());
            });
        },

        /**
         * Sync scrollTop of editor and preview
         */
        syncScrollTop: function (scrollTop) {
            var $preview = this.$('.wmd-preview');
            $preview.scrollTop(scrollTop);
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
            this.trigger('pagedown:mode', mode);
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
                i18n: $.t,

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
