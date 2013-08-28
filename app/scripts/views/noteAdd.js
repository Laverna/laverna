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
            var note = new Note(this.ui);
            console.log(note);
        }
    });
    return View;
});
