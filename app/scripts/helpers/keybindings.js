/*global define*/
/*global Mousetrap*/
define([
    'jquery',
    'app',
    'helpers/uri',
    'Mousetrap',
    'mousetrap-pause'
], function ($, App, URI) {
    'use strict';

    var Keybindings = App.module('mousetrap');

    Keybindings.bind = function () {
        var uri = URI.link('');

        // Help
        Mousetrap.bind(App.settings.appKeyboardHelp, function () {
            App.navigate(uri + '/help', true);
            return false;
        });

        // Focus on search form
        Mousetrap.bind(App.settings.appSearch, function () {
            $('#search-input').focus();
            return false;
        });

        // Create new object
        Mousetrap.bind(App.settings.appCreateNote, function () {
            if (App.currentApp) {
                App.currentApp.trigger('showForm');
            }
        });

        // Redirect to notes list
        Mousetrap.bind(App.settings.jumpInbox, function () {
            App.navigate(uri + '/notes', true);
        });

        // Redirect to favorite notes
        Mousetrap.bind(App.settings.jumpFavorite, function () {
            App.navigate(uri + '/notes/f/favorite', true);
        });

        // Redirect to removed list of notes
        Mousetrap.bind(App.settings.jumpRemoved, function () {
            App.navigate(uri + '/notes/f/trashed', true);
        });

        // Redirect to notebooks list
        Mousetrap.bind(App.settings.jumpNotebook, function () {
            App.navigate(uri + '/notebooks', true);
        });
    };

    /**
     * API
     */
    Keybindings.API = {
        pause: function () {
            Mousetrap.pause();
        },

        unpause: function () {
            Mousetrap.unpause();
        },

        reset: function () {
            Mousetrap.reset();
            App.log('Keybindings has been reseted');
        },

        restart: function () {
            Keybindings.API.reset();
            Keybindings.bind();
            App.log('Keybindings has been restarted');
        }
    };

    return Keybindings;

});
