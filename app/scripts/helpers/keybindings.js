/*global define*/
/*global Mousetrap*/
define([
    'app',
    'Mousetrap',
    'mousetrap-pause'
], function (App) {
    'use strict';

    var Keybindings = App.module('mousetrap');

    Keybindings.bind = function () {
        // Help
        Mousetrap.bind(App.settings.appKeyboardHelp, function () {
            App.log('help');
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
            App.navigate('/notes', true);
        });

        // Redirect to favorite notes
        Mousetrap.bind(App.settings.jumpFavorite, function () {
            App.navigate('/notes/f/favorite', true);
        });

        // Redirect to removed list of notes
        Mousetrap.bind(App.settings.jumpRemoved, function () {
            App.navigate('/notes/f/trashed', true);
        });

        // Redirect to notebooks list
        Mousetrap.bind(App.settings.jumpNotebook, function () {
            App.navigate('/notebooks', true);
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
        },

        restart: function () {
            Keybindings.API.reset();
            Keybindings.bind();
        }
    };

    return Keybindings;

});
