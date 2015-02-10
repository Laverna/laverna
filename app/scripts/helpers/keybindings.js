/* global define, Mousetrap */
define([
    'jquery',
    'marionette',
    'app',
    'Mousetrap',
    'mousetrap-pause'
], function($, Marionette, App) {
    'use strict';

    var Keybindings = App.module('mousetrap', {startWithParent: true}),
        Controller;

    Controller = Marionette.Controller.extend({
        initialize: function() {
            App.chanel.on('mousetrap:toggle', this.toggle, this);
            App.chanel.on('mousetrap:reset', Mousetrap.reset);
        },

        onDestroy: function() {
            App.chanel.off('mousetrap:toggle');
            App.chanel.off('mousetrap:reset');
            Mousetrap.reset();
        },

        toggle: function() {
            Mousetrap[(this.paused ? 'unpause' : 'pause')]();
            this.paused = (this.paused ? false : true);
        },

        bind: function(settings) {
            // Help
            Mousetrap.bind(settings.appKeyboardHelp, function(e) {
                e.preventDefault();
                App.chanel.trigger('navigate:link', '/help', true);
            });

            // Focus on search form
            Mousetrap.bind(settings.appSearch, function() {
                $('#search-input').focus();
                return false;
            });

            // Create new object
            Mousetrap.bind(settings.appCreateNote, function() {
                App.chanel.trigger('form:show');
            });

            // Redirect to notes list
            Mousetrap.bind(settings.jumpInbox, function() {
                App.chanel.trigger('navigate:link', '/notes', true);
            });

            // Redirect to favorite notes
            Mousetrap.bind(settings.jumpFavorite, function() {
                App.chanel.trigger('navigate:link', '/notes/f/favorite', true);
            });

            // Redirect to removed list of notes
            Mousetrap.bind(settings.jumpRemoved, function() {
                App.chanel.trigger('navigate:link', '/notes/f/trashed', true);
            });

            // Redirect to notebooks list
            Mousetrap.bind(settings.jumpNotebook, function() {
                App.chanel.trigger('navigate:link', '/notebooks', true);
            });

            App.log('Keys are binded');
        }
    });

    App.channel.on('mousetrap:restart', function() {
        Keybindings.stop();
        Keybindings.start();
    });

    /**
     * Initializers & finalizers
     */
    Keybindings.on('before:start', function() {
        Keybindings.controller = new Controller();
        Keybindings.controller.bind(App.settings);
    });

    Keybindings.on('before:stop', function() {
        Keybindings.controller.destroy();
        delete Keybindings.controller;
    });

    return Keybindings;
});
