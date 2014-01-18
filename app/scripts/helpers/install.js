/*global define*/
define([
    'underscore',
    'jquery',
    'app',
    'collections/notes'
], function (_, $, App, Notes) {
    'use strict';

    var Install = App.module('App.Install', {startWithParent: false});

    Install.on('start', function () {
        Install.API.start();
    });

    Install.API = {
        start: function () {
            if (App.firstStart  === true) {
                this.install();
            }
        },

        install: function () {
            var notes = new Notes();

            $.ajax({
                url:App.constants.URL + 'docs/README.md'
            }).done(function (text) {
                notes.create(new notes.model({
                    title: 'About Laravel',
                    content: text
                }));
            });

            $.ajax({
                url:App.constants.URL + 'docs/howto.md'
            }).done(function (text) {
                notes.create(new notes.model({
                    title: 'How to use tags and tasks',
                    content: text
                }));
            });
        }
    };

    return Install.API;
});
