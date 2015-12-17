/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'modules',
    'modules/importExport/controller'
], function(_, Marionette, Radio, Modules, Controller) {
    'use strict';

    Radio.request('init', 'add', 'module', function() {
        Radio.reply('importExport', {
            'import': function(files) {
                new Controller({method: 'import', files: files});
            },

            'export': function() {
                new Controller({method: 'export'});
            }
        });
    });

});
