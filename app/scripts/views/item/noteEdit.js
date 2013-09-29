/*global define*/
define(['underscore', 'jquery', 'backbone', 'marionette', 'text!noteFormTempl', 'checklist'],
function (_, $, Backbone, Marionette, Template, Checklist) {
    'use strict';

    var Edit = Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      :  'input[name="title"]',
            content    :  'textarea[name="content"]',
            tagsId     :  'input[name="tags"]',
//            notebookId :  'input[name="notebookId"]'
        },

        initialize: function () {
            this.on('ok', this.saveNote);
            this.on('hidden.bs.modal', this.redirect);
            this.on('render', this.afterRender);
            // this.on('cancel', this.redirect);
        },

        afterRender: function() {
            this.ui.content.mdmagick();
            this.$el.find('.mdm-control').css('width', '100%');
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
    });

    return Edit;
});
