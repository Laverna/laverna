/*global define*/
define(['underscore', 'jquery', 'backbone', 'marionette', 'text!noteFormTempl'],
function (_, $, Backbone, Marionette, Template) {
    'use strict';

    var Edit = Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      :  'input[name="title"]',
            content    :  'textarea[name="content"]',
            tagsId     :  'input[name="tags"]',
            notebookId :  'input[name="notebookId"]'
        },

        initialize: function () {
            this.on('ok', this.saveNote);
            this.on('hidden.bs.modal', this.redirect);
            // this.on('cancel', this.redirect);
        },

        /**
         * Save changes
         */
        saveNote: function () {
            // Set new value
            this.model.set('content', this.ui.content.val());
            this.model.set('title', this.ui.title.val());
            this.model.set('notebookId', this.ui.notebookId.val());
            this.model.set('tagsId', this.ui.tagsId.val().trim());
            this.model.trigger('update.note');

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
            Backbone.history.navigate('/note/' + this.model.get('id'), true);
        }
    });

    return Edit;
});
