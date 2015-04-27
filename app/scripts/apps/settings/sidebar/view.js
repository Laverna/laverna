/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/settings/sidebar/template.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Sidebar view for settings
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        events: {
            'click a': 'confirm'
        },

        serializeData: function() {
            return {
                uri: Radio.request('uri', 'link:profile', '')
            };
        },

        initialize: function() {
            Radio.channel('AppSettings')
            .comply('activate:tab', this.activateTab, this);
        },

        onDestroy: function() {
            Radio.channel('AppSettings')
            .stopComplying('activate:tab');
        },

        onRender: function() {
            this.activateTab(this.options.tab);
        },

        /**
         * Before navigating to another page, ask for confirmation.
         */
        confirm: function(e) {
            e.preventDefault();

            $.when(Radio.request('AppSettings', 'has:changes'))
            .then(function() {
                Radio.command('uri', 'navigate', $(e.currentTarget).attr('href'));
            });
        },

        activateTab: function(tab) {
            this.$('.active').removeClass('active');
            this.$('[href*=' + tab + ']').addClass('active');
        }
    });

    return View;
});
