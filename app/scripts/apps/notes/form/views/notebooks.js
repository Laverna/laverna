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
        childViewContainer :  'optgroup[label="Select"]',

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
                Radio.request('appNotebooks', 'show:form');
                this.ui.notebookId.val(this.options.activeId);
            }
        }
    });

    return View;
});