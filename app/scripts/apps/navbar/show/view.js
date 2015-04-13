/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/navbar/show/template.html'
], function($, _, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Navbar view.
     *
     * Listens to:
     * ----------
     * Events:
     * 1. channel: `global`, event: `show:search`
     *    focuses on search form
     *
     * Triggers events:
     * 1. channel: `global`, event: `search:shown`
     *    when the user opens the search form.
     * 2. channel: `global`, event: `search:hidden`
     *    when the search form is hidden or the navbar view is destroyed.
     * 3. event: `search:submit` to itself
     *    when the search form is submitted.
     * 4. channel: `global`, event: `search:change`
     *    every time when the user types something on the search form.
     *
     * Requests:
     * 1. channel: `uri`, request: `link:profile`
     * 2. channel: `uri`, request: `profile`
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        keyboardEvents:  {},

        ui: {
            navbar       : '#sidebar-nav',
            searchInput  : '.search-input'
        },

        events: {
            'click .btn-search'     : 'showSearch',
            'blur @ui.searchInput'  : 'hideSearch',
            'keyup @ui.searchInput' : 'searchKeyup',
            'submit .search-form'   : 'searchSubmit'
        },

        initialize: function() {
            this.listenTo(Radio.channel('global'), 'show:search', this.showSearch);

            // Re-render the view when notebooks collection has changed
            this.listenTo(this.options.notebooks, 'change add remove', this.render);
        },

        onDestroy: function() {
            Radio.trigger('global', 'search:hidden');
        },

        searchSubmit: function() {
            this.ui.searchInput.blur();

            this.trigger('search:submit', this.ui.searchInput.val().trim());
            Radio.trigger('global', 'search:hidden');

            return false;
        },

        showSearch: function() {
            this.ui.navbar.addClass('shown-search');
            this.ui.searchInput.focus().select();
            Radio.trigger('global', 'search:shown');

            return false;
        },

        hideSearch: function() {
            this.ui.navbar.removeClass('shown-search');
        },

        searchKeyup: function(e) {
            if (e.which === 27) {
                Radio.trigger('global', 'search:hidden');
                return this.ui.searchInput.blur();
            }
            Radio.trigger('global', 'search:change', this.ui.searchInput.val());
        },

        serializeData: function() {
            return {
                args      : this.options.args,
                notebooks : _.first(this.options.notebooks.toJSON(), 5),
                uri       : Radio.request('uri', 'link:profile', '/'),
                profile   : Radio.request('uri', 'profile')
            };
        },

        templateHelpers: function() {
            return {
                getIcon: function() {
                    return 'icon-' + (
                        !this.args.filter ? 'note' : this.args.filter
                    );
                },

                isSyncEnabled: function() {
                    return Number(this.args.configs.cloudStorage) === 1;
                },

                profileLink: function(profileName) {
                    return Radio.request(
                        'uri', 'link:profile',
                        this.args.currentUrl, profileName
                    );
                }
            };
        }
    });

    return View;
});
