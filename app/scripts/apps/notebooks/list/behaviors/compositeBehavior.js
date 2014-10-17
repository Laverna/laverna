/* global define */
define([
    'marionette'
], function(Marionette) {
    'use strict';

    var CompositeBehavior = Marionette.Behavior.extend({
        defaults: {
            regionToChange: 'tags'
        },

        initialize: function() {
            this.view.on('next', this.next, this);
            this.view.on('prev', this.prev, this);
        },

        /**
         * Returns object of currently active model
         */
        getActive: function() {
            var elActive = this.view.$('.active'),
                idActive = elActive.attr('data-id');

            if (idActive) {
                elActive.removeClass('active');
                return this.view.collection.get(idActive);
            }
        },

        next: function() {
            var model = this.getActive(),
                isLast = this.view.collection.indexOf(model) + 1 === this.view.collection.length;

            if (isLast) {
                this.view.trigger('changeRegion', this.options.regionToChange);
            }
            else if (model) {
                model.next().trigger('active');
            }
            else {
                this.view.collection.at(0).trigger('active');
            }
        },

        prev: function() {
            var model = this.getActive(),
                isFirst = this.view.collection.indexOf(model) === 0;

            if (isFirst || this.view.collection.length === 0) {
                this.view.trigger('changeRegion', this.options.regionToChange);
            }
            else if (model) {
                model.prev().trigger('active');
            }
            else {
                this.view.collection.at(this.view.collection.length-1).trigger('active');
            }
        }
    });

    return CompositeBehavior;
});
