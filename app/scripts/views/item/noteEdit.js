/*global define*/
define(['underscore', 'marionette', 'text!noteFormTempl'],
function (_, Marionette, Template) {
    'use strict';

    var Edit = Marionette.ItemView.extend({
        template: _.template(Template),

        events: {
        },

        ui: {
            title      :  'input[name="title"]',
            content    :  'textarea[name="content"]',
            tagsId     :  'input[name="tags"]',
            notebookId :  'input[name="notebookId"]'
        },

        initialize: function () {
            this.on('ok', this.saveNote);
        },

        /**
         * Save changes
         */
        saveNote: function () {
            var data = {
                title      :  this.ui.title.val().trim(),
                content    :  this.ui.content.val().trim(),
                tagsId     :  this.ui.tagsId.val().trim(),
                notebookId :  this.ui.notebookId
            };

            data.tagsId = this.collection.setTags(data.tagsId);
            var result = this.model.save(data);

            console.log(result);
        }
    });

    return Edit;
});
