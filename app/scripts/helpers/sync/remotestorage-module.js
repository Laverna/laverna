/*global define, RemoteStorage*/
define([
    'underscore',
    'remotestorage'
], function (_, remoteStorage) {
    'use strict';

    /**
     * Module which stores list of notes
     */
    RemoteStorage.defineModule('laverna', function (privateClient, publicClient) {
        var module,
            methods;

        privateClient.declareType('notes', {
            'description': 'Notes',
            'type' : 'object',
            'properties': {
                'id': {
                    'type': 'string',
                    'format': 'id',
                    'required': true
                },
                'title': {
                    'type': 'string'
                },
                'content': {
                    'type': 'string'
                },
                'taskAll':  {
                    'type': 'number'
                },
                'taskCompleted':  {
                    'type': 'number'
                },
                'created':  {
                    'type': 'number'
                },
                'updated':  {
                    'type': 'number'
                },
                'notebookId':  {
                    'type': 'string'
                },
                'tags':  {
                    'type': 'array'
                },
                'isFavorite':  {
                    'type': 'number'
                },
                'trash':  {
                    'type': 'number'
                },
                'synchronized':  {
                    'type': 'number'
                },
                'images': {
                    'type': 'array'
                }
            }
        });

        privateClient.declareType('notebooks', {
            'description': 'Notebooks',
            'type' : 'object',
            'properties': {
                'id': {
                    'type': 'string',
                    'format': 'id',
                    'required': true
                },
                'parentId': {
                    'type': 'string'
                },
                'name': {
                    'type': 'string'
                },
                'updated':  {
                    'type': 'number'
                },
                'synchronized': {
                    'type': 'number'
                }
            }
        });

        privateClient.declareType('tags', {
            'description': 'Tags',
            'type' : 'object',
            'properties': {
                'id': {
                    'type': 'string',
                    'format': 'id',
                    'required': true
                },
                'name': {
                    'type': 'string'
                },
                'updated':  {
                    'type': 'number'
                },
                'synchronized': {
                    'type': 'number'
                }
            }
        });

        privateClient.declareType('files', {
            'description': 'Files',
            'type' : 'object',
            'properties': {
                'id': {
                    'type': 'string',
                    'format': 'id',
                    'required': true
                },
                'src': {
                    'type': 'string'
                },
                'type': {
                    'type': 'string'
                },
                'synchronized': {
                    'type': 'number'
                }
            }
        });

        module = {

            cached: function () {
                var client = this.personal.apply(arguments);
                return client.cache('');
            },

            personal: function (type, path) {
                var dir = ( !path ? '' : '' + path + '/' ) + type,
                    client = privateClient.scope(dir + '/').extend(methods);

                client.modelType = type;
                return client;
            },

            shared: function (path) {
                return publicClient.scope(path + '/').extend(methods);
            }

        };

        methods = {
            modelType: null,

            get: function (id) {
                id = (typeof id === 'object' ? id.id : id);

                return this.getObject(id.toString()).then(function (obj) {
                    return obj || {};
                });
            },

            findAll: function () {
                return this.getAll().then(function(objMap) {
                    objMap = _.values(objMap);

                    // Sometimes RemoteStorage returns empty objects
                    return _.filter(objMap, function (obj) {
                        return !_.isEmpty(obj);
                    });
                });
            },

            create: function (model) {
                return this.save((model.id || privateClient.uuid()), model);
            },

            save: function (id, model) {
                model = model.toJSON();
                model.id = id;

                return this.storeObject(this.modelType, id.toString(), model).then(function () {
                    model.id = id;
                    return model;
                });
            },

            destroy: function (model) {
                model = model.toJSON();
                return this.remove( model.id.toString() ).then(function() {
                    return model;
                });
            }

        };

        return { exports: module };

    });

    return remoteStorage.laverna;

});
