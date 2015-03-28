/*global define*/
define([
    'underscore',
    'backbone.radio',
    'marionette',
    'text!modules/fuzzySearch/templates/item.html'
], function(_, Radio, Marionette, Tmpl) {
    'use strict';

    /**
     * Item view
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'list-group',

        events: {
            'click .list-group-item': 'triggerSearch'
        },

        triggerSearch: function() {
            this.trigger('navigate:search');
        },

        templateHelpers: function() {
            return {
                // Generate link
                link: function() {
                    return Radio.request('uri', 'link', {
                        filter : 'search',
                        query  : encodeURIComponent(this.title)
                    }, this);
                }
            };
        }
    });

    return View;

});
