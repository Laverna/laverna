/* global define */
define([
    'underscore',
    'marionette',
    'app',
    'apps/help/show/controller'
], function(_, Marionette, App, Controller) {
    'use strict';

    /**
     * Sub module shows keybindings list.
     */
    var Keybindings = App.module('AppHelp.Keybindings', {startWithParent: false});

    /**
     * Initializers and finalizers
     */
    Keybindings.on('before:start', function(options) {
        Keybindings.controller = new Controller(options);

        // Stop module if controller stops
        this.listenTo(Keybindings.controller, 'destroy', Keybindings.stop);
    });

    Keybindings.on('before:stop', function() {
        this.stopListening();
        delete Keybindings.controller;
    });

    return Keybindings;
});
