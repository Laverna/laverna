/*global define*/
define(['underscore', 'backbone', 'marionette', 'models/note', 'text!noteAddTempl', 'mdmagick'],
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
            this.on('render', this.afterRender)
            // this.on('cancel', this.redirect);
        },

        afterRender: function() {
            this.ui.content.mdmagick();
            this.$el.find('.mdm-control').css('width', '100%');
        },

        okClicked: function() {
            var data = {
                title      : this.ui.title.val(),
                content    : this.ui.content.val(),
                tagsId     : this.ui.tagsId.val(),
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
                Backbone.history.navigate('/note/show/' + id, true);
            }
        }
    });

    return View;
});
