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
    'text!modules/pagedown/templates/editor.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Pagedown view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),
        className: 'layout--body container-fluid',

        ui: {
            wmdBar     : '#wmd-button-bar',
            preview    : '#wmd-preview',
            input      : '#wmd-input'
        },

        events: {
            'click .pagedown--buttons button': 'triggerButton',
            'click .pagedown--col--btn': 'showColumn'
        },

        serializeData: function() {
            return {content: _.escape(this.model.get('content'))};
        },

        initialize: function() {
            Radio.on('notesForm', 'set:mode', this.onChangeMode, this);
            Radio.on('editor', 'ready', this.onPagedownReady, this);
            Radio.on('editor', 'pagedown:scroll', this.syncScroll, this);
        },

        onDestroy: function() {
            Radio.trigger('editor', 'view:destroy');
            Radio.off('editor', 'pagedown:scroll ready');
            Radio.off('notesForm', 'set:mode');
        },

        onPagedownReady: function() {
            this.$scroll = $('.ace_scrollbar');
            Radio.trigger('editor', 'view:render', this);
        },

        /**
         * Shows either the preview or the editor.
         */
        showColumn: function(e) {
            var $btn    = $(e.currentTarget),
                col     = $btn.attr('data-col'),
                hideCol = (col === 'left' ? 'right' : 'left');

            // Add 'active' class to the button
            this.$('.pagedown--col--btn.active').removeClass('active');
            $btn.addClass('active');

            // Show only one column
            this.$('.-' + hideCol).removeClass('-show');
            this.$('.-' + col).addClass('-show');
        },

        onChangeMode: function(mode) {
            if (mode === 'preview') {
                this.ui.input.css('height', 'auto');
            }
        },

        triggerButton: function(e) {
            var btn = $(e.currentTarget).attr('data-button');
            $('#' + btn).trigger('click');
        },

        syncScroll: function() {
            var scrollTop = this._getScroll(this.$scroll, this.ui.preview);
            this.ui.preview.stop(true).animate({scrollTop: scrollTop}, 100, 'linear');
        },

        _getScroll: function($source, $el) {
            var scroll = this._getScrollVal($source),
                percent = scroll.scrollTop / (scroll.scrollHeight - scroll.offsetHeight);

            return percent * (
                $el.prop('scrollHeight') - $el.offset().top
            );
        },

        _getScrollVal: function($el) {
            return {
                scrollTop    : $el.scrollTop(),
                scrollHeight : $el.prop('scrollHeight'),
                offsetHeight : $el.offset().top
            };
        }
    });

    return View;
});
