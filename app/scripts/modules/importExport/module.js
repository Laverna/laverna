/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'modules',
    'modules/importExport/controller'
], function(_, Marionette, Radio, Modules, Controller) {
    'use strict';

    Radio.request('init', 'add', 'app:before', function() {
        Radio.reply('importExport', {
            'import': function(files) {
                new Controller({method: 'import', files: files});
            },

            'export': function(data) {
                new Controller({method: 'export', data: data});
            }
        });
    });

});
