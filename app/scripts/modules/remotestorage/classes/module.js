/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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

                /**
                 * @type string type [notes|notebooks|tags]
                 * @type object obj model.attributes
                 * @type array  encryptKeys
                 */
                save: function(type, obj, encryptKeys) {
                    obj = _.clone(obj);
                    obj.id = obj.id.toString();

                    if (typeof obj.notebookId !== 'undefined') {
                        obj.notebookId = obj.notebookId.toString();
                    }
                    if (typeof obj.parentId !== 'undefined') {
                        obj.parentId = obj.parentId.toString();
                    }

                    // Send only encrypted data
                    if (obj.encryptedData) {
                        obj = _.omit(obj, encryptKeys);
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
