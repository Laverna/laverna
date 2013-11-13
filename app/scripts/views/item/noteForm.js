/*global define*/
/*global Markdown*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'models/note',
    'text!noteFormTempl',
    'checklist',
    'Mousetrap',
    'ace',
    'pagedown-ace'
],
function (_, $, Backbone, Marionette, Note, Template, Checklist, Mousetrap, ace) {
    'use strict';

    var Edit = Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      :  'input[name="title"]',
            content    :  '.wmd-input',
            tagsId     :  'input[name="tags"]',
            notebookId :  '[name="notebookId"]'
        },

        events: {
            'submit .form-horizontal': 'save',
            'click #btn': 'save',
        },

        keyboardEvents: {
            'esc': 'redirect'
        },

        initialize: function () {
            this.on('shown', this.pagedownRender);
            Mousetrap.reset();
        },

        serializeData: function () {
            var data;
            if (this.model === undefined) {
                data = {
                    title: null,
                    content: null
                };
            } else {
                data = this.model.toJSON();
            }

            data.notebooks = this.options.notebooks.toJSON();
            return data;
        },

        save: function (e) {
            e.preventDefault();

            var content = this.editor.getSession().getValue();

            // Get values
            var data = {
                title: this.ui.title.val(),
                content: content,
                notebookId: this.ui.notebookId.val()
            };

            var checklist = new Checklist().count(data.content);
            data.taskAll = checklist.all;
            data.taskCompleted = checklist.completed;

            // Existing note or new one?
            if (this.model !== undefined) {
                return this.saveNote(data);
            } else {
                return this.createNote(data);
            }
        },

        /**
         * Create new note
         */
        createNote: function (data) {
            var note = new Note(data);
            this.model = note;
            this.collection.create(note);
            return this.redirectToNote();
        },

        /**
         * Save changes
         */
        saveNote: function (data) {
            // Set new value
            this.model.set('title', data.title);
            this.model.set('content', data.content);
            // this.model.set('tagsId', this.ui.tagsId.val().trim());
            this.model.set('taskAll', data.taskAll);
            this.model.set('taskCompleted', data.taskCompleted);

            // Save changes
            var result = this.model.save({});
            this.model.trigger('update.note');

            if (result === false) {
                console.log(result);
            }
        },

        /**
         * Redirect to note
         */
        redirect: function () {
            var url = window.history;
            if (url.length === 0) {
                this.redirectToNote();
            } else {
                url.back();
            }
        },

        redirectToNote: function () {
            var id = this.model.get('id');
            Backbone.history.navigate('/note/show/' + id, true);
        },

        /**
         * Pagedown-ace editor
         */
        pagedownRender: function () {
            var converter, editor;

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

            $('.ace_content').css({'height': '100%'});

            // Focus to input[title]
            this.ui.title.focus();

            // Save after every change if its existing
            if (this.model !== undefined) {
                var form = this.$('.form-horizontal');
                this.editor.on('change', function () {
                    form.trigger('submit');
                });
            }
        }
    });

    return Edit;
});
