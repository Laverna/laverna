/*global define*/
define(['marionette'], function(Marionette) {
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
