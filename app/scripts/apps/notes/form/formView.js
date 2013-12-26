/*global define*/
/*global Markdown*/
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'text!apps/notes/form/templates/form.html',
    'checklist',
    'ace',
    'pagedown-extra',
    'backbone.mousetrap',
    'marionette',
    'typeahead',
    'tagsinput'
],
function (_, $, App, Backbone, Template, Checklist, ace) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      :  'input[name="title"]',
            content    :  '.wmd-input',
            tags       :  'select[name="tags"]',
            notebookId :  '[name="notebookId"]',
            sCont      :  '.ui-s-content'
        },

        events: {
            'submit #noteForm' : 'save',
            'click #saveBtn'   : 'save',
            'click #cancelBtn' : 'redirect'
        },

        keyboardEvents: {
            'esc': 'redirect'
        },

        initialize: function () {
            App.mousetrap.API.pause();
            this.on('shown', this.pagedownRender);
        },

        onClose: function () {
            App.mousetrap.API.unpause();
        },

        onRender: function() {
            var that = this,
                tagsNames;

            tagsNames = this.options.tags.getNames();

            // Tagsinput configuration
            this.ui.tags.tagsinput({
                freeInput   :  true,
                confirmKeys :  [13, 44, 188],
                tagClass    :  function () {
                    return 'label label-default';
                }
            });

            // Typeahead configs
            this.ui.tags.tagsinput('input')
                .typeahead({
                    name  : 'tagsInput',
                    local : tagsNames,
                })
                .on('typeahead:selected', $.proxy(function (obj, datum) {
                    that.ui.tags.tagsinput('add', datum.value);
                    that.ui.tags.tagsinput('input').typeahead('setQuery', '');
                }, this.ui.tags));

            // Show existing tags
            if (this.model !== undefined) {
                _.each(this.model.get('tags'), function (tag) {
                    this.ui.tags.tagsinput('add', tag);
                }, this);
            }
        },

        save: function (e) {
            e.preventDefault();

            var content = this.editor.getSession().getValue().trim(),
                title   = this.ui.title.val().trim(),
                data;

            // Get values
            data = {
                title      : (title !== '') ? title : 'Unnamed',
                content    : content,
                notebookId : parseInt(this.ui.notebookId.val()),
                tags       : this.ui.tags.tagsinput('items')
            };
            console.log(data.notebookId);

            // Tasks
            var checklist = new Checklist().count(data.content);
            data.taskAll = checklist.all;
            data.taskCompleted = checklist.completed;

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
            // var that = this,
            var converter,
                editor,
                wmdBar,
                scroll;

            converter = new Markdown.Converter();
            editor = new Markdown.Editor(converter);

            // ACE
            this.editor = ace.edit('wmd-input');
            this.editor.getSession().setMode('ace/mode/markdown');
            this.editor.setTheme('ace/theme/github');

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

            // Focus to input[title]
            this.ui.title.focus();

            // Whenever a change happens inside the ACE editor, update the note
            // this.editor.on('change', function () {
            //     if (that.model !== undefined) {
            //         that.$('.form-horizontal').trigger('submit');
            //     }
            // });

            // Editor bar spy your scrolls
            wmdBar = this.$('#wmd-button-bar');
            this.ui.sCont.on('scroll', function () {
                scroll = $(this).scrollTop();
                if (scroll >= 260) {
                    wmdBar.addClass('wmd-bar-fixed')
                        .css({top: scroll-2 + 'px'});
                } else {
                    wmdBar.removeClass('wmd-bar-fixed');
                }
            });
        },

        serializeData: function () {
            var data = _.extend(this.model.toJSON(), this.options.decrypted);
            data.notebooks = this.options.notebooks.toJSON();
            return data;
        },

        templateHelpers: function() {
            return {
                isActive: function (id, notebookId) {
                    var selected = '';
                    if (notebookId && id === notebookId.id) {
                        selected = ' selected="selected"';
                    }
                    return selected;
                }
            };
        }

    });

    return View;
});
