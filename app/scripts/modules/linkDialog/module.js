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
    'modules',
    'backbone.radio',
    'modules/linkDialog/controller'
], function(_, Modules, Radio, Controller) {
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
        this.stopListening();
        LinkDialog.controller = null;
    });

    Radio.request('init', 'add', 'editor:before', function(editor) {
        // Register a hook
        editor.hooks.set('insertLinkDialog', function(fnc) {
            LinkDialog.start({callback: fnc});
            return true;
        });
    });

    // Stop the module when editor is closed
    Radio.request('init', 'add', 'module', function() {
        Radio.on('editor', 'destroy', LinkDialog.stop, LinkDialog);
    });

    return LinkDialog;
});
