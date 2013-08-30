/*global define*/
define(['underscore', 'backbone', 'marionette', 'models/note', 'text!noteAddTempl'],
function (_, Backbone, Marionette, Note, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        model:  new Note(),

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
                id         : this.collection.getNewId(),
                title      : this.ui.title.val(),
                content    : this.ui.content.val(),
                tagsId     : this.collection.setTags(this.ui.tagsId.val()),
                notebookId : this.ui.notebookId.val()
            };

            var note = this.model.set(data);
            this.collection.create(note);
        },

        /**
         * Redirect to note
         */
        redirect: function () {
            var id = this.model.get('id');

            if (id === 0) {
                window.history.back();
            } else {
                Backbone.history.navigate('/note/' + id, true);
            }
        }
    });

    return View;
});
