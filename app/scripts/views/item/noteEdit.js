/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'noteForm',
    'text!noteFormTempl',
    'checklist',
    'ace',
    'pagedown-ace'
],
function (_, $, Backbone, Marionette, NoteForm, Template, Checklist) {
    'use strict';

    var Edit = Marionette.ItemView.extend(_.extend(NoteForm, {
        template: _.template(Template),

        ui: {
            title      :  'input[name="title"]',
            // content    :  'textarea[name="content"]',
            tagsId     :  'input[name="tags"]',
//            notebookId :  'input[name="notebookId"]'
        },

        initialize: function () {
            this.on('ok', this.saveNote);
            this.on('hidden.bs.modal', this.redirect);
            this.on('shown', this.pagedownRender);
            // this.on('cancel', this.redirect);
        },

        /**
         * Save changes
         */
        saveNote: function () {
            // Set new value
            this.model.set('content', this.ui.content.val());
            this.model.set('title', this.ui.title.val());
//            this.model.set('notebookId', this.ui.notebookId.val());
            this.model.set('tagsId', this.ui.tagsId.val().trim());
            this.model.trigger('update.note');

            // Count checklists
            var checklist = new Checklist().count(this.model.get('content'));
            this.model.set('taskAll', checklist.all);
            this.model.set('taskCompleted', checklist.completed);

            // Save changes
            var result = this.model.save({});

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
                url = '/note/show/' + this.model.get('id');
                Backbone.history.navigate(url);
            } else {
                url.back();
            }
        }
    }));

    return Edit;
});
