/*global define */
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!configsTempl'
], function (_, $, Backbone, Marionette, Tmpl) {
    'use strict';
    
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal-dialog',

        events: {
            'submit .form-horizontal' : 'save',
            'click .ok'               : 'save',
            'click .cancelBtn'        : 'close'
        },

        initialize: function () {
            Mousetrap.reset();
        },

        save: function () {
            console.log(this.collection);
            console.log(this.$('input'));
        }
    });

    return View;
});
