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
    'apps/notes/form/views/notebook',
    'text!apps/notes/form/templates/notebooks.html'
], function(_, Marionette, Radio, ItemView, Tmpl) {
    'use strict';

    /**
     * Notebooks view. It shows a selector of notebooks.
     *
     * requests:
     * 1. channel: `appNotebooks`, request: `show:form`
     *    in order to show the notebook form.
     */
    var View = Marionette.CompositeView.extend({
        template: _.template(Tmpl),

        childView          :  ItemView,
        childViewContainer :  '.editor--notebooks--list',

        ui: {
            notebookId : '[name="notebookId"]'
        },

        events: {
            'change @ui.notebookId': 'addNotebook'
        },

        collectionEvents: {
            'change'   : 'render',
            'add:model': 'selectModel'
        },

        onRender: function() {
            this.ui.notebookId.val(this.options.activeId);
        },

        selectModel: function(model) {
            this.ui.notebookId.val(model.id);
        },

        addNotebook: function() {
            if (this.ui.notebookId.find('.addNotebook').is(':selected')) {
                var self = this;
                Radio.request('appNotebooks', 'show:form')
                    .then(function(notebook) {

                        // Set the active notebook if one was created by the user.
                        if (notebook) {
                            self.ui.notebookId.val(notebook.id);
                        }
                    });

                this.ui.notebookId.val(this.options.activeId);
            }
        }
    });

    return View;
});
