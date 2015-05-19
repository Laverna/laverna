/* global define */
define([
    'underscore',
    'marionette',
    'app',
    'apps/help/about/controller'
], function(_, Marionette, App, Controller) {
    'use strict';

    /**
     * Sub module shows information about the app.
     */
    var About = App.module('AppHelp.About', {startWithParent: false});

    /**
     * Initializers and finalizers
     */
    About.on('before:start', function(options) {
        About.controller = new Controller(options);

        // Stop module if controller stops
        this.listenTo(About.controller, 'destroy', About.stop);
    });

    About.on('before:stop', function() {
        this.stopListening();
        delete About.controller;
    });

    return About;
});
