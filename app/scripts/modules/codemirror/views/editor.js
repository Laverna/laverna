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
            preview       : '#wmd-preview',
            previewScroll : '.editor--preview'
        },

        events: {
            'click .editor--btns .btn' : 'triggerAction',
            'click .editor--col--btn'  : 'showColumn'
        },

        initialize: function() {
            this.listenTo(this, 'editor:change', this.onEditorChange);
        },

        serializeData: function() {
            return {content: _.escape(this.model.get('content'))};
        },

        onDestroy: function() {
            Radio.trigger('editor', 'view:destroy');
        },

        onEditorChange: function(content) {
            this.ui.preview.html(content);

            if (!this.isFirst) {
                this.isFirst = true;
                return Radio.trigger('editor', 'view:render', this);
            }
            Radio.trigger('editor', 'preview:refresh');
        },

        triggerAction: function(e) {
            e.preventDefault();
            var action = $(e.currentTarget).attr('data-action');

            if (action) {
                this.trigger('editor:action', action);
            }
        },

        /**
         * Shows either the preview or the editor.
         */
        showColumn: function(e) {
            var $btn    = $(e.currentTarget),
                col     = $btn.attr('data-col'),
                hideCol = (col === 'left' ? 'right' : 'left');

            // Add 'active' class to the button
            this.$('.editor--col--btn.active').removeClass('active');
            $btn.addClass('active');

            // Show only one column
            this.$('.-' + hideCol).removeClass('-show');
            this.$('.-' + col).addClass('-show');
        },

    });

    return View;
});
