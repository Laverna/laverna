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
    'apps/notebooks/list/behaviors/compositeBehavior',
    'apps/notebooks/list/views/notebooksItem',
    'text!apps/notebooks/list/templates/notebooksList.html'
], function(_, Marionette, Behavior, ItemView, Tmpl) {
    'use strict';

    /**
     * Notebooks composite view.
     * Everything happens in its behavior class.
     */
    var View = Marionette.CompositeView.extend({
        template: _.template(Tmpl),

        childView          : ItemView,
        childViewContainer : '.list-notebooks',

        behaviors: {
            CompositeBehavior: {
                behaviorClass: Behavior
            }
        },

        /**
         * Build a tree structure
         */
        showCollection: function() {
            Marionette.CompositeView.prototype.showCollection.apply(this, arguments);

            var fragment = document.createDocumentFragment();

            this.children.each(function(view) {
                this.attachFragment(this, view, fragment);
            }, this);

            this.$(this.childViewContainer).append(fragment);
        },

        /**
         * Don't use the default method of attaching items
         */
        attachHtml: function() {},

        /**
         * For performance's sake attach items into fragment.
         */
        attachFragment: function(colView, itemView, fragment) {
            var parentId = String(itemView.model.get('parentId'));

            // It isn't a child notebook
            if (parentId === '0' || parentId === '' ||
                !fragment.getElementById(parentId)) {
                fragment.appendChild(itemView.el);
            }
            else {
                fragment.getElementById(parentId).appendChild(itemView.el);
            }
        }

    });

    return View;
});
