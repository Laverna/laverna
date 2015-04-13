/* global define, Mousetrap */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'Mousetrap',
    'mousetrap-pause'
], function(_, Marionette, Radio) {
    'use strict';

    /**
     * Keybindings helper.
     *
     * Complies to commands on `global` channel:
     * 1. `mousetrap:toggle`  - pause or unpause Mousetrap.
     * 2. `mousetrap:restart` - rebind the keys.
     * 3. `mousetrap:reset`   - reset the keys.
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {
            // Fetch configs and bind the keys
            this.configs = Radio.request('global', 'configs');
            this.bind();

            Radio.comply('global', {
                'mousetrap:toggle'  : this.toggle,
                'mousetrap:restart' : this.restart,
                'mousetrap:reset'   : Mousetrap.reset
            }, this);
        },

        /**
         * Reset Mousetrap keys and bind them again.
         */
        restart: function() {
            Mousetrap.reset();
            this.bind();
        },

        /**
         * Pause or unpause Mousetrap
         */
        toggle: function() {
            Mousetrap[(this.paused ? 'unpause' : 'pause')]();
            this.paused = (this.paused ? false : true);
        },

        /**
         * Register keybindings.
         */
        bind: function() {
            // Help
            Mousetrap.bind(this.configs.appKeyboardHelp, function(e) {
                e.preventDefault();
                Radio.command('uri', 'navigate', '/help', true);
            });

            // Focus on search form
            Mousetrap.bind(this.configs.appSearch, function(e) {
                e.preventDefault();
                Radio.trigger('global', 'show:search');
            });

            // Add or edit notes or notebooks
            Mousetrap.bind(this.configs.appCreateNote, function() {
                Radio.trigger('global', 'form:show');
            });

            // Redirect to notes list
            Mousetrap.bind(this.configs.jumpInbox, function() {
                Radio.command('uri', 'navigate', '/notes', {trigger: true});
            });

            // Redirect to favorite notes
            Mousetrap.bind(this.configs.jumpFavorite, function() {
                Radio.command('uri', 'navigate', '/notes/f/favorite', true);
            });

            // Redirect to removed list of notes
            Mousetrap.bind(this.configs.jumpRemoved, function() {
                Radio.command('uri', 'navigate', '/notes/f/trashed', true);
            });

            // Redirect to notebooks list
            Mousetrap.bind(this.configs.jumpNotebook, function() {
                Radio.command('uri', 'navigate', '/notebooks', true);
            });
        }

    });

    /**
     * Initializer
     */
    Radio.command('init', 'add', 'app:before', function() {
        new Controller();
    });

    return Controller;
});
