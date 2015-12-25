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
    'marionette',
    'backbone.radio',
    'text!modules/codemirror/templates/editor.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Codemirror view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),
        className: 'layout--body container-fluid',

        ui: {
            preview    : '#wmd-preview',
        },

        events: {
            'click .editor--btns .btn': 'triggerAction'
        },

        initialize: function() {
            this.listenTo(this, 'editor:change', this.onEditorChange);
        },

        serializeData: function() {
            return {content: _.escape(this.model.get('content'))};
        },

        onEditorChange: function(content) {
            this.ui.preview.html(content);
        },

        triggerAction: function(e) {
            e.preventDefault();
            var action = $(e.currentTarget).attr('data-action');

            if (action) {
                this.trigger('editor:action', action);
            }
        },
    });

    return View;
});
