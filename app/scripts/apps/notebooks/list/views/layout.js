/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/notebooks/list/templates/layout.html',
    'backbone.mousetrap'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Notebooks layout view.
     * It shows lists of tags and notebooks.
     *
     * Listens to events:
     * 1. channel: `appNotebooks`, event: `change:region`
     *    switches to another region.
     *
     * Triggers events:
     * 1. `navigate:next` to currently active region
     * 2. `navigate:previous` to currently active region
     *
     * Commands:
     * 1. channel: `uri`, command: `navigate`
     */
    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },

        keyboardEvents: {
            'enter'  : 'openActive'
        },

        // Default active region is `notebooks`
        activeRegion: 'notebooks',

        initialize: function() {
            // Register keyboard events
            this.keyboardEvents[this.options.configs.navigateBottom] = 'triggerNext';
            this.keyboardEvents[this.options.configs.navigateTop]    = 'triggerPrevious';
            this.keyboardEvents[this.options.configs.actionsOpen]    = 'openActive';
            this.keyboardEvents[this.options.configs.actionsEdit]    = 'openEdit';
            this.keyboardEvents[this.options.configs.actionsRemove]  = 'triggerRemove';

            // Listen to events
            this.listenTo(Radio.channel('appNotebooks'), 'change:region', this.changeRegion);
        },

        onBeforeDestroy: function() {
            this.stopListening();
        },

        triggerNext: function() {
            this[this.activeRegion].currentView.trigger('navigate:next');
        },

        triggerPrevious: function() {
            this[this.activeRegion].currentView.trigger('navigate:previous');
        },

        triggerRemove: function() {
            var $a = this.$('.list-group-item.active').parent().find('.remove-link:first');
            $a.trigger('click');
            return false;
        },

        openActive: function() {
            var $a = this.$('.list-group-item.active');
            Radio.command('uri', 'navigate', $a.attr('href'));
        },

        openEdit: function() {
            var $a = this.$('.list-group-item.active').parent().find('.edit-link:first');
            Radio.command('uri', 'navigate', $a.attr('href'));
        },

        changeRegion: function(regionName, direction) {
            this.activeRegion = regionName;

            /*
             * Reset active model variable and
             * call either triggerNext or triggerPrevious method
             */
            this[this.activeRegion].currentView.options.activeModel = null;
            this['trigger' + direction]();
        }
    });

    return View;

});
