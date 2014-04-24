/*global define*/
define([
    'underscore',
    'jquery',
    'app',
    'collections/notes',
    'collections/configs',
], function (_, $, App, Notes, Configs) {
    'use strict';

    var Install = App.module('App.Install', {startWithParent: false});

    Install.on('start', function () {
        Install.API.start();
    });

    Install.API = {
        start: function () {
            var configs = new Configs();

            if (App.firstStart  === true) {
                this.install();
            }
            else if (App.settings.appVersion !== App.constants.VERSION) {
                App.log('New version of application is available');

                // Increase appVersion
                configs.create(new configs.model({ name: 'appVersion', value: App.constants.VERSION }));
            }
        },

        install: function () {
            var notes = new Notes(),
                note;

            $.ajax({
                url: App.constants.URL + 'docs/README.md',
                dataType: 'text'
            }).done(function (text) {
                note = new notes.model();
                note.save({
                    title: 'About Laverna',
                    content: text
                });
            });

            $.ajax({
                url: App.constants.URL + 'docs/howto.md',
                dataType: 'text'
            }).done(function (text) {
                note = new notes.model();

                $.when(
                    note.save({
                        title: 'How to use tags and tasks',
                        content: text
                    })
                ).done(
                    // Reload notes list
                    function () {
                        App.trigger('notes:list');
                    }
                );
            });
        }

    };

    return Install.API;
});
