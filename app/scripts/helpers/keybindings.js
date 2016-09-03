/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'mousetrap',
    'mousetrap.pause'
], function(_, Marionette, Radio, Mousetrap) {
    'use strict';

    /**
     * Keybindings helper.
     *
     * Replies to requests on `global` channel:
     * 1. `mousetrap:toggle`  - pause or unpause Mousetrap.
     * 2. `mousetrap:restart` - rebind the keys.
     * 3. `mousetrap:reset`   - reset the keys.
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {
            // Fetch configs and bind the keys
            this.configs = Radio.request('configs', 'get:object');
            this.bind();

            Radio.reply('global', {
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

        navigate: function(uri) {
            Radio.request('uri', 'navigate', uri, {
                includeProfile : true,
                trigger        : true
            });
        },

        /**
         * Register keybindings.
         */
        bind: function() {
            var self = this;

            // Help
            Mousetrap.bind(this.configs.appKeyboardHelp, function(e) {
                e.preventDefault();
                Radio.request('Help', 'show:keybindings');
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
                self.navigate('/notes');
            });

            // Redirect to favorite notes
            Mousetrap.bind(this.configs.jumpFavorite, function() {
                self.navigate('/notes/f/favorite');
            });

            // Redirect to removed list of notes
            Mousetrap.bind(this.configs.jumpRemoved, function() {
                self.navigate('/notes/f/trashed');
            });

            // Redirect to list of notes with open tasks
            Mousetrap.bind(this.configs.jumpOpenTasks, function() {
                self.navigate('/notes/f/task');
            });

            // Redirect to notebooks list
            Mousetrap.bind(this.configs.jumpNotebook, function() {
                self.navigate('/notebooks');
            });
        }

    });

    /**
     * Initializer
     */
    Radio.request('init', 'add', 'app:before', function() {
        new Controller();
    });

    return Controller;
});
