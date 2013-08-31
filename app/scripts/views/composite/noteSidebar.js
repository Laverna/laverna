/*global define */
define(['underscore', 'marionette', 'noteSidebarItem', 'text!noteSidebarTempl'],
function(_, Marionette, NoteSidebarItem, Template) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Template),

        itemView: NoteSidebarItem,

        itemViewContainer: '.main > .list-group',

        className: 'sidebar-notes',

        events: {
            'click .list-group-item': 'changeFocus',
            'keypress .search-form input[type="text"]': 'search'
        },

        initialize: function () {
//            this.listenTo(this.collection, 'create', this.render);
        },

        search: function(e) {
            var el = $(e.currentTarget);
            if (el.val().length >= 1) {
                // var collection = this.collection.search(el.val());
            }
        },

        changeFocus: function(e) {
            this.$el.find('.list-group-item.active').removeClass('active');
            $(e.currentTarget).addClass('active');
        }

    });

    return View;
});
