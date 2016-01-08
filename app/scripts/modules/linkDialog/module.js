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
    'q',
    'modules',
    'backbone.radio',
    'modules/linkDialog/controller'
], function(_, Q, Modules, Radio, Controller) {
    'use strict';

    /**
     * Custom link dialog for an editor.
     *
     * Listens for events:
     * 1. channel: `editor`, event: `destroy` - stops itself
     *
     * Adds `insertLinkDialog` hook to Pagedown editor.
     */
    var LinkDialog = Modules.module('LinkDialog', {});

    /**
     * Initializers & finalizers of the module
     */
    LinkDialog.on('before:start', function(options) {
        LinkDialog.controller = new Controller(options);

        this.listenTo(LinkDialog.controller, 'destroy', LinkDialog.stop);
    });

    LinkDialog.on('before:stop', function() {
        console.info('LinkDialog stopped');

        this.stopListening();
        LinkDialog.controller = null;
    });

    // Stop the module when editor is closed
    Radio.request('init', 'add', 'module', function() {
        Radio.on('editor', 'destroy', LinkDialog.stop, LinkDialog);

        Radio.reply('editor', 'show:link', function() {
            var defer = Q.defer();

            LinkDialog.start({callback: function(link) {
                defer.resolve(link);
            }});

            return defer.promise;
        });
    });

    return LinkDialog;
});
