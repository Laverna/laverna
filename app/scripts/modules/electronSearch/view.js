/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requireNode */
define([
    'underscore',
    'marionette',
    'text!modules/electronSearch/template.html'
], function(_, Marionette, Tmpl) {
    'use strict';

    var remote = requireNode('electron').remote,
        View;

    View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'electron--search',

        ui: {
            'search': '[name="text"]'
        },

        events: {
            'input @ui.search'     : 'onInput',
            'keyup @ui.search'     : 'destroyOnEsc',

            'submit form'          : 'next',
            'click #search--next'  : 'next',

            'click #search--prev'  : 'previous',
            'click .search--close' : 'destroy'
        },

        initialize: function() {
            _.bindAll(this, 'onFind');
            this.listenTo(this, 'rendered', this.onRendered);
        },

        onRendered: function() {
            this.ui.search.focus();
        },

        onDestroy: function() {
            remote.getCurrentWindow().webContents.stopFindInPage('clearSelection');
        },

        destroyOnEsc: function(e) {
            if (e.keyCode === 27) {
                this.destroy();
            }
        },

        onFind: function() {
            this.ui.search.focus();
        },

        onInput: function() {
            this.search();

            // Prevent it from losing focus
            remote.getCurrentWindow().webContents.once('found-in-page', this.onFind);

            return true;
        },

        next: function() {
            this.search();
            return false;
        },

        previous: function() {
            this.search(true);
            return false;
        },

        search: function(backSearch) {
            var text = this.ui.search.val();

            if (text) {
                if (backSearch) {
                    return remote.getCurrentWindow().webContents.findInPage(text, {forward: false});
                }

                return remote.getCurrentWindow().webContents.findInPage(text);
            }
        },

    });

    return View;
});
