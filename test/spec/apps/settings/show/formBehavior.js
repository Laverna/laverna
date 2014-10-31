/* global define */
define([
    'jquery'
], function ($) {
    'use strict';

    return function testChangeTrigger (view, done) {
        var inputs = $('input, select, textarea', view.$el),
            triggered = 0;

        view.collection.on('new:value', function () {
            if (triggered === (inputs.length - 1)) {
                done();
                return;
            }
            triggered++;
        });

        inputs.trigger('change');
    };
});
