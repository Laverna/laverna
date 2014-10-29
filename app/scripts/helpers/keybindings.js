/* global define, Mousetrap */
define([
    'jquery',
    'marionette',
    'app',
    'helpers/uri',
    'Mousetrap',
    'mousetrap-pause'
], function($, Marionette, App, URI) {
    'use strict';

    var Keybindings = App.module('mousetrap', {startWithParent: true}),
        Controller;

    Controller = Marionette.Controller.extend({
        initialize: function() {
            App.vent.on('mousetrap:toggle', this.toggle, this);
            App.vent.on('mousetrap:reset', Mousetrap.reset);
        },

        onDestroy: function() {
            App.vent.off('mousetrap:toggle');
            App.vent.off('mousetrap:reset');
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
                App.navigate(URI.link('/help'), true);
            });

            // Focus on search form
            Mousetrap.bind(settings.appSearch, function() {
                $('#search-input').focus();
                return false;
            });

            // Create new object
            Mousetrap.bind(settings.appCreateNote, function() {
                App.vent.trigger('form:show');
            });

            // Redirect to notes list
            Mousetrap.bind(settings.jumpInbox, function() {
                App.navigate(URI.link('/notes'), true);
            });

            // Redirect to favorite notes
            Mousetrap.bind(settings.jumpFavorite, function() {
                App.navigate(URI.link('/notes/f/favorite'), true);
            });

            // Redirect to removed list of notes
            Mousetrap.bind(settings.jumpRemoved, function() {
                App.navigate(URI.link('/notes/f/trashed'), true);
            });

            // Redirect to notebooks list
            Mousetrap.bind(settings.jumpNotebook, function() {
                App.navigate(URI.link('/notebooks'), true);
            });

            App.log('Keys are binded');
        }
    });

    App.vent.on('mousetrap:restart', function() {
        Keybindings.stop();
        Keybindings.start();
    });

    /**
     * Initializers & finalizers
     */
    Keybindings.addInitializer(function() {
        Keybindings.controller = new Controller();
        Keybindings.controller.bind(App.settings);
    });

    Keybindings.addFinalizer(function() {
        Keybindings.controller.destroy();
        delete Keybindings.controller;
    });

    return Keybindings;
});
