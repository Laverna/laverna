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
    'modules/fileDialog/controller',
    'modules/fileDialog/helper'
], function(_, Q, Modules, Radio, Controller, Helper) {
    'use strict';

    /**
     * File dialog.
     * It shows a dialog where a user can upload files.
     *
     * Listens for events:
     * 1. channel: `editor`, event: `destroy`
     *    stops itself
     * 2. channel: `editor`, event: `converter:init`
     *    adds hooks.
     * 3. channel: `noteView`, event: `view:destroy`
     *    revokes all generated URLs
     *
     * Replies to requests on channel `editor`:
     * 1. `get:files` - parses the text for file links and returns
     *                  an array of IDs.
     *
     * Adds the following hooks to Pagedown editor:
     * 1. `insertImageDialog`
     * 2. `postConversion`
     */
    var FileDialog = Modules.module('FileDialog', {});

    /**
     * Initializers & finalizers of the module
     */
    FileDialog.on('before:start', function(options) {
        FileDialog.controller = new Controller(options);
        this.listenTo(FileDialog.controller, 'destroy', FileDialog.stop);
    });

    FileDialog.on('before:stop', function() {
        console.info('FileDialog stopped');

        Helper.revokeUrls();
        this.stopListening();
        FileDialog.controller = null;
    });

    /**
     * Add converter hooks
     */
    function addHook(converter, model) {
        // Do not add hooks if a model wasn't provided.
        if (!model) {
            return;
        }

        converter.hooks.chain('preConversion', function(text) {
            return Helper.toHtml(text, model);
        });

        // Make colons normal again
        converter.hooks.chain('postConversion', function(text) {
            return text.replace(/(blob:http)&#58;/g, '$1:');
        });
    }

    // Radio.request('init', 'add', 'editor:before', function(editor, model) {
    //     editor.hooks.set('insertImageDialog', function(fnc) {
    //         return true;
    //     });
    // });

    Radio.request('init', 'add', 'module', function() {

        // Stop the module when editor is closed.
        Radio.on('editor', 'destroy', FileDialog.stop, FileDialog);

        // Show custom dialog on `insertImageDialog` hook.
        Radio.reply('editor', 'show:attachment', function(model) {
            var defer = Q.defer();

            FileDialog.start({model: model, callback: function(link) {
                defer.resolve(link);
            }});

            return defer.promise;
        });

        Radio.reply('editor', 'get:files', Helper.getFileIds, Helper);

        // When editor converter is initialized, add hooks
        Radio.on('editor', 'converter:init', addHook);

        // Revoke all URLs when a note is closed.
        Radio.on('noteView', 'view:destroy', Helper.revokeUrls, Helper);
    });

    return FileDialog;
});
