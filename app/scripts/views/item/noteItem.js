/*global define */
define(['underscore', 'marionette', 'text!noteItemTempl'],
function (_, Marionette, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'content-notes',

        events: {
            'click .favorite': 'favorite'
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        favorite: function(e) {
            e.preventDefault();
            var isFavorite = this.model.get('isFavorite');

            if (isFavorite === 1) {
                isFavorite = 0;
            } else {
                isFavorite = 1;
            }

            this.model.save({isFavorite: isFavorite});
        },

        templateHelpers: function() {
            var model = this.model;
            return {
                getContent: function() {
                    return model.get('content');
                }
            };
        }
    });

    return View;
});
