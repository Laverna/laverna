/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'models/notebook',
    'text!notebookFormTempl',
    'Mousetrap'
],
function (_, $, Backbone, Marionette, Notebook, Tmpl, Mousetrap) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            name     : 'input[name="name"]',
            parentId : 'select[name="parentId"]'
        },

        events: {
            'submit .form-horizontal': 'save'
        },

        initialize: function () {
            this.bind('ok', this.save);
            this.bind('hidden.bs.modal', this.close);
            Mousetrap.reset();
        },

        serializeData: function () {
            return {
                notebooks: this.options.collection.toJSON()
            };
        },

        save: function (e) {
            if (e.$el === undefined) {
                e.preventDefault();
            } else {
                e.preventClose();
            }

            var data = {
                name     : this.ui.name.val(),
                parentId : this.ui.parentId.val()
            };

            if (this.model !== undefined) {
                return this.update(data);
            } else {
                return this.create(data);
            }
        },

        /**
         * Update existing notebook
         */
        update: function () {
        },

        /**
         * Create new notebook
         */
        create: function (data) {
            data.order = this.collection.nextOrder();

            var notebook = new Notebook(data);
            this.collection.create(notebook);
            return this.redirect();
        },

        redirect: function () {
            Backbone.history.navigate('/notebooks', true);
        },

        close: function (m) {
            m.preventClose();
            this.redirect();
        }
    });

    return View;
});
