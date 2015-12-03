/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
            Help.currentApp = null;
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
        },

        firstStart: function() {
            if (!Number(Radio.request('configs', 'get:config', 'firstStart'))) {
                return;
            }

            requirejs(['apps/help/firstStart/app'], function(Module) {
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
        Radio.once('global', 'app:start', controller.firstStart, controller);

        Radio.reply('Help', {
            'show:about'        : controller.about,
            'show:keybindings'  : controller.keybindings
        }, controller);
    });

    return Help;
});
