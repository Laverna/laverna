/*global define*/
define(['underscore', 'marionette', 'models/note', 'text!noteAddTempl'],
function (_, Marionette, Note, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title: 'input[name="title"]',
            content: 'textarea[name="content"]',
            tagsId: 'input[name="tags"]',
            notebookId: 'input[name="notebookId"]'
        },

        initialize: function() {
            this.on('ok', this.okClicked);
            this.on('cancel', this.redirect);
        },

        okClicked: function() {
            var data = {
                id: this.collection.getNewId(),
                title: this.ui.title.val(),
                content: this.ui.content.val(),
                tagsId: this.collection.setTags(this.ui.tagsId.val()),
                notebookId: this.ui.notebookId.val()
            };
            var note = new Note(data);
            this.collection.create(note);
        },


        /**
         * Redirect to note
         */
        redirect: function () {
            window.history.back();
        }
    });

    return View;
});
