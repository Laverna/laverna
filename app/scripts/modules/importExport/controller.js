/* global define */
define([
    'underscore',
    'q',
    'marionette',
    'backbone.radio',
    'jszip',
    'helpers/fileSaver'
], function(_, Q, Marionette, Radio, JSZip, fileSaver) {
    'use strict';

    /**
     * Import or export all data from Laverna app to a zip file.
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;
            this[options.method]();
        },

        /**
         * Import data from a ZIP archive.
         */
        import: function() {

            // Check file extension
            if (!this.options.files || !this.options.files.length ||
               (this.options.files[0].type !== 'application/zip' &&
               _.last(this.options.files[0].name.split('.')) !== 'zip')) {
                return;
            }

            var reader = new FileReader(),
                self   = this;

            this.zip   = new JSZip();

            reader.onload = function(evt) {
                try {
                    self.zip.load(evt.target.result);

                    // Start importing process
                    self.importData()
                    .then(function() {
                        document.location.reload();
                    });
                } catch (e) {
                }
            };

            reader.readAsArrayBuffer(this.options.files[0]);
        },

        /**
         * Import data from a loaded ZIP archive to DB.
         */
        importData: function() {
            var self     = this,
                promises = [];

            _.each(this.zip.files, function(file) {

                // Ignore directories and non JSON files
                if (file.dir || _.last(file.name.split('.')) !== 'json') {
                    return;
                }

                var path = file.name.split('/');

                // Notes should be imported differently
                if (path[2] === 'notes') {
                    return promises.push(function() {
                        return self.importNote(path[1], file.name, self.zip.file(file.name).asText());
                    });
                }

                // path[2].split('.json')[0] === [notebooks|tags|configs]
                promises.push(function() {
                    return self.importCollection(path[1], path[2].split('.json')[0], self.zip.file(file.name).asText());
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .fail(function(e) {
                console.error('importProfiles:', e);
            });
        },

        /**
         * Import an array of items.
         *
         * @type string profile
         * @type string type [notebooks|tags|configs]
         * @type object data
         */
        importCollection: function(profile, type, data) {
            if (_.indexOf(['notebooks', 'tags', 'configs'], type) === -1) {
                return new Q();
            }

            return Radio.request(type, 'save:all:raw', JSON.parse(data), {
                profile: profile
            });
        },

        /**
         * Import a note to DB.
         *
         * @type string profile
         * @type string name
         * @type object data
         */
        importNote: function(profile, name, data) {
            data = JSON.parse(data);

            name = name.split('.');
            name[name.length - 1] = 'md';
            name = name.join('.');

            data.content = this.zip.file(name).asText();

            return Radio.request('notes', 'save:raw', data, {
                profile: profile
            });
        },

        /**
         * Export all data to a ZIP archive.
         */
        export: function() {
            if (this.options.data) {
                return this.exportData();
            }

            var profiles = Radio.request('configs', 'get:config', 'appProfiles'),
                promises = [],
                self     = this;

            this.zip = new JSZip();

            // Get data from each profile
            _.each(profiles, function(profile) {
                promises.push(function() {
                    return self.exportProfile(profile);
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                var content = self.zip.generate({type: 'blob'});
                return self.saveToFile(content, 'laverna-backup.zip');
            });
        },

        /**
         * Export already fetched data.
         */
        exportData: function() {
            if (!_.keys(this.options.data).length) {
                return;
            }

            var content;
            this.zip = new JSZip();

            _.each(this.options.data, function(data, profile) {
                this.addToZip(profile, data.notes, data.notebooks, data.tags, data.configs);
            }, this);

            content = this.zip.generate({type: 'blob'});
            return this.saveToFile(content, 'laverna-backup.zip');
        },

        /**
         * Export data from a profile.
         * @type string profile
         */
        exportProfile: function(profile) {
            var self = this;

            return Q.all([
                Radio.request('notes', 'fetch', {profile: profile}),
                Radio.request('notebooks', 'fetch', {profile: profile}),
                Radio.request('tags', 'fetch', {profile: profile}),
                Radio.request('configs', 'fetch', {profile: profile})
            ])
            .spread(function(notes, notebooks, tags, configs) {
                notes = notes.fullCollection ? notes.fullCollection : notes;
                return self.addToZip(profile, notes.toJSON(), notebooks.toJSON(), tags.toJSON(), configs.toJSON());
            })
            .fail(function(e) {
                console.error('exportProfile:', e);
            });
        },

        /**
         * Add collections to ZIP archive.
         * @type string profile
         */
        addToZip: function(profile, notes, notebooks, tags, configs) {
            var self = this,
                path = 'laverna-backups/' + profile + '/';

            // Save notes as JSON and Markdown files
            _.each(notes, function(note) {
                self.zip.file(path + 'notes/' + note.id + '.md', note.content);
                self.zip.file(path + 'notes/' + note.id + '.json', JSON.stringify(_.omit(note, 'content')));
            });

            self.zip.file(path + 'notebooks.json', JSON.stringify(notebooks));
            self.zip.file(path + 'tags.json', JSON.stringify(tags));
            self.zip.file(path + 'configs.json', JSON.stringify(configs));

            return;
        },

        saveToFile: function(data, fileName) {
            return fileSaver(data, fileName)
            .then(_.bind(function() {

                // Destroy this controller
                this.zip = null;
                this.destroy();
            }, this));
        },

    });

    return Controller;
});
