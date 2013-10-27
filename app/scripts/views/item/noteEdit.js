/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'models/note',
    'noteForm',
    'text!noteFormTempl',
    'checklist',
    'Mousetrap',
    'ace',
    'pagedown-ace'
],
function (_, $, Backbone, Marionette, Note, NoteForm, Template, Checklist, Mousetrap, ace) {
    'use strict';

    var Edit = Marionette.ItemView.extend(_.extend(NoteForm, {
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
        }
    }));

    return Edit;
});
