/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'apps/notebooks/list/views/tagsItem',
    'text!apps/notebooks/list/templates/tagsList.html'
], function (_, App, Marionette, URI, ItemView, Templ) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Templ),
        itemView: ItemView,

        itemViewContainer: '.list-notebooks',

        initialize: function () {
            this.on('next', this.next, this);
            this.on('prev', this.prev, this);
        },

        getActive: function () {
            var elActive = this.$('.active'),
                idActive = elActive.attr('data-id');

            if (idActive) {
                elActive.removeClass('active');
                return this.collection.get(idActive);
            }
        },

        next: function () {
            var tag = this.getActive(),
                isLast = this.collection.indexOf(tag)+1 === this.collection.length;

            if (isLast) {
                tag.trigger('active');
            } else if (tag) {
                tag.next().trigger('active');
            } else {
                this.collection.at(0).trigger('active');
            }
        },

        prev: function () {
            var tag = this.getActive(),
                isFirst = this.collection.indexOf(tag) === 0;

            if (isFirst) {
                this.trigger('changeRegion', 'notebooks');
            } else if (tag) {
                tag.prev().trigger('active');
            } else {
                this.collection.at(0).trigger('active');
            }
        },

        templateHelpers: function () {
            return {
                i18n: $.t,
                uri : URI.link
            };
        }
    });

    return View;
});
