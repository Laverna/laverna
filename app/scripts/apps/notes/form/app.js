/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'backbone.radio',
    'marionette',
    'apps/notes/form/controller'
], function(_, $, App, Radio, Marionette, Controller) {
    'use strict';

    /**
     * Form app. Instantiates form controller.
     *
     * Listens to the following events:
     * 1. channel: notesForm, event: stop
     *    stops itself
     */
    var Form = App.module('AppNote.Form', {
        startWithParent: false
    });

    Form.on('before:start', function(options) {
        Form.controller = new Controller(options);
        Radio.on('notesForm', 'stop', Form.stop, Form);
    });

    Form.on('before:stop', function() {
        Radio.off('notesForm', 'stop');
        Form.controller.destroy();
        delete Form.controller;
    });

    return Form;
});
