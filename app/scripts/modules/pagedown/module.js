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
    'backbone.radio',
    'marionette',
    'modules',
    'modules/pagedown/controllers/pagedownAce',
    'modules/pagedown/libs/converter'
], function(_, Radio, Marionette, Modules, PagedownAce, converter) {
    'use strict';

    /**
     * Pagedown module.
     *
     * Replies to the following requests on channel `editor`:
     * 1. reply: content:html
     *    converts Markdown content to html.
     * 2. reply: task:toggle
     *    returns an object with content and a number of completed tasks
     */
    var Pagedown = Modules.module('Pagedown', {});

    /**
     * Initializers & finalizers of the module
     */
    Pagedown.on('start', function() {
        console.info('Pagedown module has started');
        Pagedown.controller = new PagedownAce();
    });

    Pagedown.on('stop', function() {
        Pagedown.controller.destroy();
        Pagedown.controller = null;
        console.info('Pagedown module has stoped');
    });

    // Add a global module initializer
    Radio.request('init', 'add', 'module', function() {
        console.info('Pagedown module has been initialized');

        Radio.channel('notesForm')
        .on('view:ready', Pagedown.start, Pagedown)
        .on('view:destroy', Pagedown.stop, Pagedown);

        Radio.channel('editor')
        .reply('content:html', converter.toHtml, converter);
        // .reply('task:toggle', converter.toggleTask, converter);
    });

    return Pagedown;

});
