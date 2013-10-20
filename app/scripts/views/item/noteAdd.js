/*global define*/
define(['underscore', 'backbone', 'marionette', 'models/note', 'text!noteAddTempl', 'pagedown', 'ace'],
function (_, Backbone, Marionette, Note, Template, Markdown, ace) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      : 'input[name="title"]',
            content    : 'textarea[name="content"]',
            tagsId     : 'input[name="tags"]',
//            parentId   : 'input[name="parentId"]'
        },

        initialize: function() {
            this.on('ok', this.okClicked);
            this.on('hidden.bs.modal', this.redirect);
            this.on('render', this.afterRender)
            // this.on('cancel', this.redirect);
        },

        afterRender: function() {
            var converter = Markdown.getSanitizingConverter();
            var editor = new Markdown.Editor(converter);
            
            var text = this.$('#wmd-input').innerHTML;
            var ace1 = ace.edit('wmd-input');
            ace1.setValue(text, -1);
            editor.run(ace1);
        },

        okClicked: function() {
            var data = {
                title      : this.ui.title.val(),
                content    : this.ui.content.val(),
                tagsId     : this.ui.tagsId.val(),
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
