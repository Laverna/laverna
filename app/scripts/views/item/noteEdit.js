/*global define*/
define(['underscore', 'jquery', 'backbone', 'marionette', 'text!noteFormTempl'],
function (_, $, Backbone, Marionette, Template) {
    'use strict';

    var Edit = Marionette.ItemView.extend({
        template: _.template(Template),

//        events: {
//            'unload window': 'unload'
//        },

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
            var data = {
                'title'      :  this.ui.title.val().trim(),
                'content'    :  this.ui.content.val().trim(),
                'tagsId'     :  this.ui.tagsId.val().trim(),
                'notebookId' :  this.ui.notebookId
            };

            this.model.set('title', data.title);

//            data.tagsId = this.collection.setTags(data.tagsId);
//            var result = this.model.set(data);

//            this.model.trigger('update.note');

//            if (result === false) {
//                console.log(result);
//            }
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
