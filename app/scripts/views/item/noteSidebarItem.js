/*global define */
define(['underscore', 'marionette', 'text!noteSidebarItemTempl'],
function(_, Marionette, Template){
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        initialize: function () {
            this.listenTo(this.model,  'change', this.render);
            this.listenTo(this.model,  'change:trash', this.remove);
        },

        templateHelpers: function () {
            return {
                getContent: function(text) {
                    var converter = new Showdown.converter();
                    return converter.makeHtml(text);
                }
            }
        }

    });

    return View;
});
