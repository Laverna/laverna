/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'app',
    'apps/notebooks/form/tag/controller'
], function(_, Marionette, Radio, App, Controller) {
    'use strict';

    /**
     * Tag form module.
     *
     * Replies to requests on channel `appNotebooks`
     * 1. request: `form:stop` - stops itself.
     */
    var Form = App.module('AppNotebooks.Form.Tag', {startWithParent: false});

    Form.on('before:start', function(options) {
        Form.controller = new Controller(options);

        Radio.reply('appNotebooks', 'form:stop', Form.stop, Form);
    });

    Form.on('before:stop', function() {
        Radio.stopReplying('appNotebooks', 'form:stop');

        Form.controller.destroy();
        Form.controller = null;
    });

    return Form;

});
