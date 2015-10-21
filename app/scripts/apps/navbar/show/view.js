/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'behaviors/sidemenu',
    'text!apps/navbar/show/template.html'
], function($, _, Marionette, Radio, Sidemenu, Tmpl) {
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

        behaviors: {
            Sidemenu: {
                behaviorClass: Sidemenu
            }
        },

        ui: {
            navbar : '#sidebar--nav',
            search : '#header--search--input',
            title  : '#header--title',
            icon   : '#header--icon'
        },

        events: {
            'click #header--add'     : 'navigateAdd',
            'click #header--sbtn'    : 'showSearch',
            'click #header--about'   : 'showAbout',
            'blur @ui.search'        : 'hideSearch',
            'keyup @ui.search'       : 'searchKeyup',
            'submit #header--search' : 'searchSubmit'
        },

        collectionEvents: {
            'change': 'render'
        },

        initialize: function() {
            this.listenTo(this, 'change:title', this.changeTitle);
            this.listenTo(Radio.channel('global'), 'show:search', this.showSearch);

            // Re-render the view when notebooks collection has changed
            this.listenTo(this.options.notebooks, 'change add remove', this.render);
        },

        onDestroy: function() {
            Radio.trigger('global', 'search:hidden');
        },

        /**
         * Trigger form:show event when add button is clicked.
         */
        navigateAdd: function() {
            Radio.trigger('global', 'form:show');
            return false;
        },

        /**
         * Change navbar title
         */
        changeTitle: function(options) {
            var icon = this.templateHelpers().getIcon.apply(options);

            this.ui.title.text($.t(options.title));
            this.ui.icon.attr('class', icon);
            this.options.args = options.args;
        },

        searchSubmit: function() {
            this.ui.search.blur();

            this.trigger('search:submit', this.ui.search.val().trim());
            Radio.trigger('global', 'search:hidden');

            return false;
        },

        showSearch: function() {
            this.ui.navbar.addClass('-search');
            this.ui.search.focus().select();
            Radio.trigger('global', 'search:shown');

            return false;
        },

        hideSearch: function() {
            this.ui.navbar.removeClass('-search');
        },

        showAbout: function(e) {
            e.preventDefault();
            Radio.request('Help', 'show:about');
        },

        searchKeyup: function(e) {
            if (e.which === 27) {
                Radio.trigger('global', 'search:hidden');
                return this.ui.search.blur();
            }
            Radio.trigger('global', 'search:change', this.ui.search.val());
        },

        serializeData: function() {
            return {
                args      : this.options.args,
                configs   : this.collection.getConfigs(),
                profiles  : this.options.profiles.getValueJSON(),
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
                    return Number(this.configs.cloudStorage) === 1;
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
