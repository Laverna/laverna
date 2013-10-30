/*global define*/
define([
    'underscore',
    'backbone',
    'marionette',
    'models/note',
    'noteForm',
    'text!noteFormTempl',
    'ace',
    'pagedown-ace'
], function (_, Backbone, Marionette, Note, NoteForm, Template, ace) {
    'use strict';

    var View = Marionette.ItemView.extend(_.extend(NoteForm, {
        template: _.template(Template),

        ui: {
            title      : 'input[name="title"]',
            content    : 'textarea[name="content"]',
            tagsId     : 'input[name="tags"]',
//            parentId   : 'input[name="parentId"]'
        },

        initialize: function() {
            this.on('ok', this.save);
            this.on('hidden.bs.modal', this.redirect);
            this.on('shown', this.pagedownRender);
            // this.on('cancel', this.redirect);
        },

        save: function() {
            var data = {
                title      : this.ui.title.val(),
                content    : this.ui.content.val(),
                tagsId     : this.ui.tagsId.val(),
            };

            var note = new Note(data);
            this.model = note;
            this.collection.create(note);
            this.collection.sort();
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
    }));

    return View;
});
