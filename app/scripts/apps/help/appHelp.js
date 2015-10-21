/* global define, requirejs */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app'
], function(_, Marionette, Radio, App) {
    'use strict';

    var Help = App.module('AppHelp', {startWithParent: false}),
        controller;

    function startModule(module, args) {
        if (!module) {
            return;
        }

        // Stop previous module
        if (Help.currentApp) {
            Help.currentApp.stop();
        }
        // Start this subapp
        else {
            Help.start();
        }

        Help.currentApp = module;
        module.start(args);

        // If module has stopped, remove the variable and stop itself
        module.on('stop', function() {
            Help.stop();
            delete Help.currentApp;
        });
    }

    controller = {
        keybindings: function() {
            requirejs(['apps/help/show/app'], function(Module) {
                startModule(Module);
            });
        },

        about: function() {
            requirejs(['apps/help/about/app'], function(Module) {
                startModule(Module);
            });
        }
    };

    Help.on('before:start', function() {
    });

    Help.on('before:stop', function() {
    });

    // Add initializer
    Radio.request('init', 'add', 'app', function() {
        Radio.reply('Help', {
            'show:about'        : controller.about,
            'show:keybindings'  : controller.keybindings
        }, controller);
    });

    return Help;
});
