/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'modules',
    'backbone.radio',
    'prettify'
], function($, _, Marionette, Modules, Radio, prettify) {
    'use strict';

    /**
     * Google code prettify module.
     */
    var CodePrettify = Modules.module('CodePrettify', {});

    function render(view) {
        var $pre = view ? view.$('pre') : $('pre'),
            code;

        // Google code prettify
        $pre.addClass('prettyprint').each(function(idx, el) {
            code = el.firstChild;
            code.innerHTML = prettify.prettyPrintOne(code.innerHTML);
        });
    }

    /**
     * Initializers & finalizers of the module
     */
    CodePrettify.on('start', function(view) {
        render(view);

        // Events
        Radio.on('editor', 'preview:refresh', render);
    });

    CodePrettify.on('stop', function() {
        Radio.off('editor', 'preview:refresh');
    });

    Radio.request('init', 'add', 'module', function() {
        // When a note is shown, start this module
        Radio.on('noteView', {
            'view:render'  : CodePrettify.start,
            'view:destroy' : CodePrettify.stop
        }, CodePrettify);

        // When an editor view is shown, start this module
        Radio.on('editor', {
            'view:render'  : CodePrettify.start,
            'view:destroy' : CodePrettify.stop
        }, CodePrettify);
    });

    return CodePrettify;
});
