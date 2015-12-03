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
    'behaviors/modalForm',
    'text!modules/linkDialog/templates/dialog.html'
], function(_, Marionette, Radio, ModalForm, Tmpl) {
    'use strict';

    /**
     * Link dialog view
     */
    var View = Marionette.LayoutView.extend({
        template  : _.template(Tmpl),
        className : 'modal fade',

        regions: {
            notes: '#noteMenu'
        },

        behaviors: {
            ModalForm: {
                behaviorClass : ModalForm,
                uiFocus       : 'url'
            }
        },

        ui: {
            url      : '[name=url]',
            dropdown : '.dropdown',
            create   : '.create'
        },

        events: {
            'keyup @ui.url' : 'handleUrl'
        },

        triggers:{
            'click @ui.create' : 'create:note'
        },

        initialize: function() {
            this.listenTo(this, 'dropdown:toggle', this.dropdownToggle);
            this.listenTo(Radio.channel('LinkDialog'), 'attach:link', this.attachLink);
        },

        /**
         * Hide or show the dropdown menu
         */
        dropdownToggle: function(length) {
            this.ui.dropdown.toggleClass('open', length || 0 > 0);
        },

        /**
         * When a link is attached, hide create button and dropdown menu
         */
        onAttachLink: function() {
            this.ui.create.addClass('hidden');
            this.ui.url.focus();
            this.dropdownToggle();
        },

        attachLink: function(data) {
            this.ui.url.val(data.url);
            this.onAttachLink();
        },

        handleUrl: _.throttle(function() {
            var val = this.ui.url.val().trim();

            // If it is a link, we don't have to do anything
            if (val === '' || val.match(/^(#|(https?|file|ftp):\/)/) !== null) {
                return this.onAttachLink();
            }

            // Search for an existing note and show note creation button
            this.ui.create.toggleClass('hidden', false);
            this.trigger('search', val);
        }, 300),
    });

    return View;
});
