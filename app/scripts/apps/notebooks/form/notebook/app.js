/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/notebooks/form/notebook/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    /**
     * Notebook form module.
     *
     * Complies to commands on channel `appNotebooks`
     * 1. command: `form:stop` - stops itself.
     */
    var Form = App.module('AppNotebooks.Form.Notebook', {startWithParent: false});

    Form.on('before:start', function(options) {
        Form.controller = new Controller(options);

        Radio.comply('appNotebooks', 'form:stop', Form.stop, Form);
    });

    Form.on('before:stop', function() {
        Radio.stopComplying('appNotebooks', 'form:stop');

        Form.controller.destroy();
        delete Form.controller;
    });

    return Form;

});
