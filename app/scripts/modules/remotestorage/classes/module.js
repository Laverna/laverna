/* global define, RemoteStorage */
define([
    'underscore',
    'modules/remotestorage/classes/rs'
], function(_, RS) {
    'use strict';

    /**
     * RemoteStorage module.
     */
    RemoteStorage.defineModule('laverna', function(prClient) {
        prClient.declareType('notes', {
            '$schema':     'http://json-schema.org/draft-03/schema#',
            'description': 'Notes',
            'type' : 'object',
            'properties': {
                'id': {
                    'type'     : 'string',
                    'required' : true
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
                /*
                'files': {
                    'type': 'array'
                }
                */
            }
        });

        prClient.declareType('notebooks', {
            '$schema':     'http://json-schema.org/draft-03/schema#',
            'description': 'Notebooks',
            'type' : 'object',
            'properties': {
                'id': {
                    'type'     : 'string',
                    'format'   : 'id',
                    'required' : true
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

        prClient.declareType('tags', {
            '$schema':     'http://json-schema.org/draft-03/schema#',
            'description': 'Tags',
            'type' : 'object',
            'properties': {
                'id': {
                    'type'     : 'string',
                    'format'   : 'id',
                    'required' : true
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

        return {
            exports: {
                on      : prClient.on,
                profile : null,

                init: function(profile) {
                    // RS.caching.set('/', 'FLUSH');
                    prClient.cache('');
                    this.profile = profile;
                },

                save: function(type, obj) {
                    obj.id = obj.id.toString();

                    if (obj.notebookId) {
                        obj.notebookId = obj.notebookId.toString();
                    }
                    if (obj.parentId) {
                        obj.parentId = obj.parentId.toString();
                    }

                    return prClient.storeObject(type, this.profile + '/' + type + '/' + obj.id, obj);
                },

                destroy: function(type, obj) {
                    obj.id = obj.id.toString();
                    return prClient.remove(this.profile + '/' + type + '/' + obj.id);
                },

                getAll: function(type) {
                    return prClient.getAll(this.profile + '/' + type + '/');
                },

                getById: function(type, obj) {
                    obj.id = obj.id.toString();
                    return prClient.getObject(this.profile + '/' + type + '/' + obj.id);
                }
            }
        };
    });

    return RS.laverna;
});
