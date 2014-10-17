/*global define */
define([
    'underscore',
    'backbone',
    'text!apps/notebooks/list/templates/layout.html',
    'backbone.mousetrap',
    'marionette'
], function(_, Backbone, Templ) {
    'use strict';

    /**
     * Layout view. Shows notebooks and tag's list
     */
    var LayoutView = Backbone.Marionette.LayoutView.extend({
        template: _.template(Templ),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },

        keyboardEvents: {
            'enter'  : 'openActiveLink'
        },

        initialize: function() {
            var settings = this.options.settings;
            this.keyboardEvents[settings.navigateBottom] = 'next';
            this.keyboardEvents[settings.navigateTop] = 'prev';
            this.keyboardEvents[settings.actionsOpen] = 'openActiveLink';
            this.keyboardEvents[settings.actionsEdit] = 'openEdit';
        },

        openEdit: function() {
            var $a = this.$('.list-group-item.active').parent().find('.edit-link');
            if ($a.length) {
                this.trigger('navigate', $a.attr('href'));
            }
        },

        openActiveLink: function() {
            var $a = this.$('.list-group-item.active');
            if ($a.length) {
                this.trigger('navigate', $a.attr('href'));
            }
        },

        /**
         * Navigation: next
         */
        next: function() {
            this.activeRegion = this.activeRegion || 'notebooks';
            this[this.activeRegion].currentView.trigger('next');
            this[this.activeRegion].currentView.on('changeRegion', this.changeRegion, this);
        },

        /**
         * Navigation: prev
         */
        prev: function() {
            this.activeRegion = this.activeRegion || 'notebooks';
            this[this.activeRegion].currentView.trigger('prev');
            this[this.activeRegion].currentView.on('changeRegion', this.changeRegion, this);
        },

        /**
         * Makes another region active for example 'notebooks'
         */
        changeRegion: function(region) {
            if (this.options[region] !== 0) {
                this.activeRegion = region;
            }
        }
    });

    return LayoutView;
});
