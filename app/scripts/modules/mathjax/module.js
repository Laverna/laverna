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
    'mathjax',
    'modules/mathjax/libs/mathjax'
], function(_, Modules, Radio, MathJax, math) {
    'use strict';

    /**
     * MathJax module. Renders MathJax.
     */
    var MathjaxModule = Modules.module('MathjaxModule', {});

    // Configure MathJax
    MathJax.Hub.Config({
        jax     : ['input/TeX', 'output/HTML-CSS'],
        tex2jax : {
            inlineMath     : [['$', '$']],
            displayMath    : [['$$', '$$']],
            processClass   : 'math',
            ignoreClass    : 'layout',
            processEscapes : true
        }
    });

    /**
     * Initializers & finalizers of the module
     */
    MathjaxModule.on('start', function(view) {
        // Render MathJax on start
        math.render(view);

        // Re-render MathJax every time when preview is refreshed.
        Radio.on('editor', 'preview:refresh', _.debounce(math.render, 350), math);
    });

    MathjaxModule.on('stop', function() {
        console.info('MathJax has stopped');

        math.view = null;
        Radio.off('editor', 'preview:refresh');
    });

    /**
     * Start listening to events.
     */
    Radio.request('init', 'add', 'module', function() {

        // When a note is shown, start this module
        Radio.on('noteView', {
            'view:render'  : MathjaxModule.start,
            'view:destroy' : MathjaxModule.stop
        }, MathjaxModule);

        // When an editor view is shown, start this module
        Radio.on('editor', {
            'view:render'  : MathjaxModule.start,
            'view:destroy' : MathjaxModule.stop
        }, MathjaxModule);
    });

    return MathjaxModule;
});
