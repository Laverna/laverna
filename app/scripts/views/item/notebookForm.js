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
            name: 'input[name="name"]'
        },

        events: {
            'submit .form-horizontal': 'save'
        },

        initialize: function () {
            this.bind('ok', 'save');
            Mousetrap.reset();
        },

        save: function (e) {
            e.preventDefault();

            var data = {
                name: this.ui.name.val()
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
            var notebook = new Notebook(data);
            this.collection.create(notebook);
            return this.redirect();
        },

        redirect: function () {
            Backbone.history.navigate('/notebooks', true);
        }
    });

    return View;
});
