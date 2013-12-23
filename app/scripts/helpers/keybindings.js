/*global define*/
/*global Mousetrap*/
define([
    'app',
    'Mousetrap'
], function (App) {
    'use strict';

    var Keybindings = App.module('mousetrap');

    // Help
    Mousetrap.bind(App.settings.appKeyboardHelp, function () {
        console.log('help');
        return false;
    });

    // Create new object
    Mousetrap.bind(App.settings.appCreateNote, function () {
        App.trigger('createNew');
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

    /**
     * API
     */
    Keybindings.API = {
        pause: function () {
            Mousetrap.pause();
        },

        unpause: function () {
            Mousetrap.unpause();
        }
    };

    return Keybindings;

});
