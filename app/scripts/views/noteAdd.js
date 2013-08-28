/*global define*/
define([
    'marionette',
    'underscore',
    'models/note',
    'text!templates/notes/add.html'
], function(Marionette, _, Note, Template){
    var View = Marionette.ItemView.extend({
        template: _.template(Template),
        ui: {
            title: 'input[name="title"]',
            content: 'textarea[name="content"]',
            tagsId: 'input[name="tags"]',
            notebookId: 'input[name="notebookId"]'
        },

        initialize: function(){
            this.on('ok', this.okClicked);
        },

        okClicked: function(modal){
            var data = {
                title: this.ui.title.val(),
                content: this.ui.content.val(),
                tagsId: this.ui.tagsId.val(),
                notebookId: this.ui.notebookId.val()
            }
            var note = new Note(data);
            this.collection.create(note);
        }
    });
    return View;
});
