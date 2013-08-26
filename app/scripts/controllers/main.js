/*global define*/
define([
    'marionette',
    'bootstrap-modal',
    // Views
    'views/noteAdd'
], function(Marionette, Modal, noteAdd) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Index page
         */
        index: function () {
            console.log('index page');
        },

        /* ------------------------------
         * Notes actions
         * ------------------------------ */
        note: function (id) {
            console.log('note page' + id);
        },

        noteAdd: function () {
            new Backbone.BootstrapModal({
                content: new noteAdd(),
            }).open();
            console.log('add page');
        },

        noteEdit: function () {
        },

        noteRemove: function () {
        },

        /* ------------------------------
         * Notebooks actions
         * ------------------------------ */
        notebook: function () {
        },

        notebookAdd: function () {
        },

        notebookEdit: function () {
        },

        notebookRemove: function () {
        }

    });

    return Controller;
});
