/*global define*/
define(['marionette'], function(Marionette) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        index: function() {
            console.log('index page');
        }
    });

    return Controller;
});
