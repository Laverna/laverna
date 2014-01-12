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
    'pagedown-extra',
    'marionette'
],
function (_, $, App, Backbone, Template, Checklist, Tags, ace) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      :  'input[name="title"]',
            content    :  '.wmd-input',
            tags       :  'select[name="tags"]',
            notebookId :  '[name="notebookId"]',
            sCont      :  '.ui-s-content',
            // Mode stuff
            article    :  '.article',
            form       :  '#noteForm',
            wmdBar     :  '#wmd-button-bar',
            preview    :  '.preview-col',
        },

        events: {
            'submit #noteForm' : 'save',
            'click #modeMenu a': 'switchMode',
            'click #saveBtn'   : 'save',
            'click .saveBtn'   : 'save',
            'click #cancelBtn' : 'redirect',
            'keyup input[name=title]'  : 'keyupEvents'
        },

        initialize: function () {
            _.bindAll(this, 'scrollPagedownBar');
            this.on('shown', this.pagedownRender);
            this.on('shown', this.changeMode);
            App.mousetrap.API.pause();
            this.$body = $('body');
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
            this.$('#modeMenu a[data-mode="' + App.settings.editMode + '"]').trigger('click');
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
                content    : content,
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
         * Pagedown-ace editor
         */
        pagedownRender: function () {
            var converter,
                editor;

            converter = new Markdown.Converter();
            Markdown.Extra.init(converter);

            // Customize markdown converter
            converter.hooks.chain('postNormalization', function (text) {
                text = new Checklist().toHtml(text);
                return new Tags().toHtml(text);
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
            this.editor.renderer.setShowGutter(false);
            this.editor.renderer.setPrintMarginColumn(false);
            this.editor.session.setUseWrapMode(true);
            this.editor.session.setNewLineMode('unix');

            // Auto expand: http://stackoverflow.com/questions/11584061/automatically-adjust-height-to-contents-in-ace-cloud9-editor
            this.editor.setOptions({
                maxLines: Infinity,
                minLines: 40
            });

            // this.editor.setKeyboardHandler('vim'); // vim
            editor.run(this.editor);

            // Hide default buttons
            this.$('.wmd-button-row li').addClass('btn').css('left', 0).find('span').hide();
            this.$('.wmd-button-row').addClass('btn-group');

            // Font-awesome buttons
            this.$('#wmd-italic-button').append($('<i class="fa fa-italic">'));
            this.$('#wmd-bold-button').append($('<i class="fa fa-bold">'));
            this.$('#wmd-link-button').append($('<i class="fa fa-globe">'));
            this.$('#wmd-quote-button').append($('<i class="fa fa-indent">'));
            this.$('#wmd-code-button').append($('<i class="fa fa-code">'));
            this.$('#wmd-image-button').append($('<i class="fa fa-picture-o">'));
            this.$('#wmd-olist-button').append($('<i class="fa fa-list-ol">'));
            this.$('#wmd-ulist-button').append($('<i class="fa fa-list">'));
            this.$('#wmd-heading-button').append($('<i class="fa fa-font">'));
            this.$('#wmd-hr-button').append($('<i class="fa fa-minus">'));
            this.$('#wmd-undo-button').append($('<i class="fa fa-reply">'));
            this.$('#wmd-redo-button').append($('<i class="fa fa-share">'));

            this.$('.wmd-button-row').append($('<li class="wmb-button btn btn-success saveBtn" id="wmd-save-button" title="Save note" style="left: 0px;">Save </li>'));
            this.$('#wmd-save-button').append($('<span style="display: none; background-position: -240px -20px;"></span>'));
            this.$('#wmd-save-button').append($('<i class="fa fa-save">'));
            this.$('#wmd-save-button').css('display', 'none');

            // Dropdown mode for changing modes
            this.$('.wmd-button-row').prepend($('<li class="btn-group dropdown" id="wmd-mode-button" title="Change mode" style="left: 0px;"></li>'));
            this.$('#wmd-mode-button').append($('<a href="#" id="switchMode" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i class="fa fa-arrows-alt"></i> <b class="caret"></b></a>'));
            this.$('#wmd-mode-button').append($('<ul id="modeMenu" class="dropdown-menu pull-right" role="menu" aria-labelledby="switchMode"></ul>'));
            this.$('#wmd-mode-button #modeMenu').append($('<li><a href="#" data-mode="fullscreen"><i class="fa fa-arrows-alt"></i> Fullscreen</a></li>'));
            this.$('#wmd-mode-button #modeMenu').append($('<li><a href="#" data-mode="preview"><i class="fa fa-eye"></i> Preview</a></li>'));
            this.$('#wmd-mode-button #modeMenu').append($('<li><a href="#" data-mode="normal"><i class="fa fa-square"></i> Normal</a></li>'));
            this.$('#wmd-mode-button').css('display', 'none');

            // Focus to input[title]
            this.ui.title.focus();

            // Whenever a change happens inside the ACE editor, update the note
            // this.editor.on('change', function () {
            //     if (that.model !== undefined) {
            //         that.$('.form-horizontal').trigger('submit');
            //     }
            // });
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
                // Save when user hits Enter
                case 13:
                    this.save(e);
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
                // Fix WMD bar
                this.scrollPagedownBar();
            }
            switch (mode) {
                case 'fullscreen':
                    this.distractionFreeMode();
                    this.$('#wmd-save-button').css('display', 'block');
                    this.$('#wmd-mode-button').css('display', 'block');
                    this.$('#wmd-mode-button').removeClass('open');
                    break;
                case 'preview':
                    this.previewMode();
                    this.$('#wmd-save-button').css('display', 'block');
                    this.$('#wmd-mode-button').css('display', 'block');
                    this.$('#wmd-mode-button').removeClass('open');
                    break;
                default:
                    this.normalMode();
                    this.$('#wmd-save-button').css('display', 'none');
                    this.$('#wmd-mode-button').css('display', 'none');
                    this.$('#wmd-mode-button').removeClass('open');
                    break;
            }
            if (mode) {
                this.$body.fadeIn('slowly');
            }
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
            // Two panels
            this.ui.article.addClass('row');
            this.ui.form.addClass('col-xs-6 col-sm-6 col-lg-6');
            this.ui.preview.addClass('col-xs-6 col-sm-6 col-lg-6').removeClass('hide');
        },

        /**
         * Edit text in normal mode
         */
        normalMode: function () {
            this.$body.removeClass('distraction-free two-column');
            this.ui.wmdBar.removeClass('navbar navbar-fixed-top');
            // Disable two panels
            this.ui.article.removeClass('row');
            this.ui.form.removeClass('col-xs-6 col-sm-6 col-lg-6');
            this.ui.preview.removeClass('col-xs-6 col-sm-6 col-lg-6').addClass('hide');
        },

        serializeData: function () {
            var data = _.extend(this.model.toJSON(), this.options.decrypted);
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
