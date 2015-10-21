/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/notebooks/list/templates/layout.html',
    'mousetrap'
], function(_, Marionette, Radio, Tmpl, Mousetrap) {
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
     * requests:
     * 1. channel: `uri`, request: `navigate`
     */
    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },

        // Default active region is `notebooks`
        activeRegion: 'notebooks',

        initialize: function() {
            _.bindAll(this, 'triggerNext', 'triggerPrevious', 'openActive', 'openEdit', 'triggerRemove');

            // Register keyboard events
            Mousetrap.bind(this.options.configs.navigateBottom, this.triggerNext);
            Mousetrap.bind(this.options.configs.navigateTop, this.triggerPrevious);
            Mousetrap.bind(this.options.configs.actionsOpen, this.openActive);
            Mousetrap.bind(this.options.configs.actionsEdit, this.openEdit);
            Mousetrap.bind(this.options.configs.actionsRemove, this.triggerRemove);

            // Listen to events
            this.listenTo(Radio.channel('appNotebooks'), 'change:region', this.changeRegion);
        },

        onBeforeDestroy: function() {
            Mousetrap.unbind([
                this.options.configs.navigateBottom,
                this.options.configs.navigateTop,
                this.options.configs.actionsOpen,
                this.options.configs.actionsEdit,
                this.options.configs.actionsRemove
            ]);
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
            Radio.request('uri', 'navigate', $a.attr('href'));
        },

        openEdit: function() {
            var $a = this.$('.list-group-item.active').parent().find('.edit-link:first');
            Radio.request('uri', 'navigate', $a.attr('href'));
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
