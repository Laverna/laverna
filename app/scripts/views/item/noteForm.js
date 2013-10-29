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
            // notebookId :  'input[name="notebookId"]'
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
            if (this.model === undefined) {
                return {
                    title: null,
                    content: null
                };
            } else {
                return this.model.toJSON();
            }
        },

        save: function (e) {
            e.preventDefault();

            // Get values
            var editor = ace.edit('wmd-input');
            var data = {
                title: this.ui.title.val(),
                content: editor.getSession().getValue()
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
//            this.model.set('notebookId', this.ui.notebookId.val());
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
            var wmd = ace.edit('wmd-input');

            wmd.renderer.setShowGutter(false);
            wmd.renderer.setPrintMarginColumn(false);
            wmd.session.setUseWrapMode(true);
            wmd.session.setNewLineMode('unix');

            editor.run(wmd);

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
        }
    });

    return Edit;
});
