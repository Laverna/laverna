/*global define*/
define(['underscore', 'backbone', 'marionette', 'models/note', 'text!noteAddTempl'],
function (_, Backbone, Marionette, Note, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      : 'input[name="title"]',
            content    : 'textarea[name="content"]',
            tagsId     : 'input[name="tags"]',
            notebookId : 'input[name="notebookId"]'
        },

        initialize: function() {
            this.on('ok', this.okClicked);
            this.on('hidden.bs.modal', this.redirect);
            // this.on('cancel', this.redirect);
        },

        okClicked: function() {
            var data = {
                title      : this.ui.title.val(),
                content    : this.ui.content.val(),
                tagsId     : this.collection.setTags(this.ui.tagsId.val()),
                notebookId : this.ui.notebookId.val()
            };

            var note = new Note(data);
            this.model = note;
            this.collection.create(note);
        },

        /**
         * Redirect to note
         */
        redirect: function () {
            if (this.model === undefined) {
                window.history.back();
            } else {
                var id = this.model.get('id');
                Backbone.history.navigate('/note/' + id, true);
            }
        }
    });

    return View;
});
