/*global define */
define([
    'underscore',
    'marionette',
    'text!noteSidebarItemTempl'
], function(_, Marionette, Template){
    'use strict';
    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        initialize: function(){
            this.listenTo(this.model,  'change', this.render);
        }

    });
    return View;
});
