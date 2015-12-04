/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'behaviors/modalForm',
    'models/notebook',
    'text!apps/notebooks/form/notebook/templates/form.html'
], function(_, $, Marionette, ModalForm, Notebook, Tmpl) {
    'use strict';

    /**
     * Notebook form view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        ui: {
            name     : 'input[name="name"]',
            parentId : 'select[name="parentId"]'
        },

        behaviors: {
            ModalForm: {
                behaviorClass: ModalForm
            }
        },

        serializeData: function() {
            return _.extend(this.model.toJSON(), {
                notebooks: this.collection.toJSON()
            });
        },

        templateHelpers: function() {
            return {
                isParent: function(notebookId) {
                    if (this.parentId === notebookId) {
                        return ' selected="selected"';
                    }
                }
            };
        }
    });

    return View;
});
