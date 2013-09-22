/*global define*/
define(['underscore', 'backbone', 'marionette', 'models/note', 'text!noteAddTempl', 'typeahead', 'mdmagick'],
function (_, Backbone, Marionette, Note, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        ui: {
            title      : 'input[name="title"]',
            content    : 'textarea[name="content"]',
            tagsId     : 'input[name="tags"]',
            parentId : 'input[name="parentId"]'
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

            this.ui.parentId.typeahead({
                valueKey: 'title',
                local: this.collection.toJSON()
            });
            this.ui.parentId.on('typeahead:selected', function(e, model){
                $(e.currentTarget).attr('data-id', model.id);
            });
        },

        okClicked: function() {
            var data = {
                title      : this.ui.title.val(),
                content    : this.ui.content.val(),
                tagsId     : this.ui.tagsId.val(),
            };

            if (this.ui.parentId.attr('data-id')) {
                data['parentId'] = this.ui.parentId.attr('data-id');
            }
            else {
                if (this.ui.parentId.val() !== '') {
                    var parents = this.collection.filter(function(model){
                        return model.get('title') === this.ui.parentId.val()
                    }, this);
                    data['parentId'] = parents[0]['id'];
                }
            }

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
