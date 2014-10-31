/* global define, requirejs, Modernizr */
define([
    'jquery',
    'app',
    'bootstrap'
], function($, App) {
    'use strict';

    function startApp() {
        var request;

        // Browser doesn't support neither indexeddb nor websql
        if ( ( !Modernizr.indexeddb && !Modernizr.websqldatabase ) ||
            !Modernizr.localstorage ) {
            window.alert('Your browser is outdated and does not support IndexedDB and/or LocalStorage.');
            return;
        }

        request = window.indexedDB.open('MyTestDatabase');
        request.onerror = function() {
            window.appNoDB = true;
            App.start();
        };
        request.onsuccess = function() {
            App.start();
        };
    }

    $(document).ready(function() {
        if ( !Modernizr.indexeddb ) {
            requirejs(['IndexedDBShim'], function() {
                window.appNoDB = true;
                window.shimIndexedDB.__useShim(true);
                startApp();
            });
        }
        else {
            startApp();
        }
    });
});
