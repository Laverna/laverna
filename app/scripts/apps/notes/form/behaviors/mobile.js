/* global define */
define([
    'marionette'
], function(Marionette) {
    'use strict';

    var Desktop = Marionette.Behavior.extend({
        initialize: function() {
            console.warn('Hullo', 'mobile');
        },
    });

    return Desktop;
});
