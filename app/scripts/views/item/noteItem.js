/*global define */
define(['underscore', 'marionette', 'text!templates/notes/item.html'],
function (_, Marionette, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),
        className: 'content-notes',
        events: {
            'click .favorite': 'favorite'
        },
        initialize: function(){
            this.listenTo(this.model, 'change', this.render);
        },
        favorite: function(e){
            e.preventDefault();
            if (this.model.get('isFavorite') === 1){
                this.model.save('isFavorite', 0);
            } else if (this.model.get('isFavorite') === 0) {
                this.model.save('isFavorite', 1);
            }
        },
        templateHelpers: function() {
            var model = this.model;
            return {
                getContent: function(){
                    return model.get('content');
                }
            };
        }
    });

    return View;
});
