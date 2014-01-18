/*global define*/
define([
    'jquery',
    'backbone',
    'app'
], function ($, Backbone, App) {
    'use strict';

    /**
     * Shows animated synchronize status
     */
    var SyncStatus = App.module('SyncStatus', {startWithParent : false}),
        $syncStatus;

    SyncStatus.start = function () {
        $syncStatus = $('#syncStatus');

        App.on('sync:before', function () {
            $syncStatus.addClass('animate-spin');
        });

        App.on('sync:after', function () {
            $syncStatus.removeClass('animate-spin');
        });
    };

    return SyncStatus;

});
