;var DropboxSync = function(dropboxClient) {

    "use strict";

    if (dropboxClient == void 0) {
        throw new Error('no dropbox client');
    }

    if (false === (dropboxClient instanceof Dropbox.Client)) {
        throw new Error('invalid dropbox client');
    }

    var contentCache = [];

    var _writeToFile = function(filename, fileContent) {

        var d = $.Deferred();
        dropboxClient.writeFile(filename, JSON.stringify(fileContent), function(error, stat) {
            if (error) d.reject(error);
            else {
                d.resolve(stat);
            }

            return true;
        });
        return d;
    };

    var _writeToFileDebounced = _.debounce(_writeToFile, 600);


    var _readFile = function(filename, opts) {

        opts = opts || {};

        var d = $.Deferred();

        if ((opts.resetCache === void 0 ||
             opts.resetCache === false) &&
             contentCache[filename] !== void 0) {
            d.resolve();
        } else {

            dropboxClient.readFile(filename, function(error, fileContent) {

                //extend and clear
                contentCache[filename] = {
                    current:0,
                    items:[]
                };

                if (error) {

                    // create empty model store file if not existing
                    if (Dropbox.ApiError.NOT_FOUND === error.status) {
                        $.when(_writeToFile(filename, contentCache[filename]))
                            .fail(d.reject)
                            .done(d.resolve);
                    }
                    else {
                        d.reject(error);
                    }
                }

                else {

                    if (fileContent.length > 0) {
                        contentCache[filename] = JSON.parse(fileContent);
                    }

                    d.resolve();
                }
            });
        }

        return d;
    };

    var _syncModel = function(model, items, options) {
        model.trigger('sync', model, items, options);
        options.success(items);
        return true;
    };


    function _read(store, model, options) {

        // nothing to do because model has no id
        if (model instanceof Backbone.Model &&
            model.attributes[model.idAttribute] === void 0) {
            return _syncModel(model, [], options);
        }

        var items = contentCache[store].items;

        // handle if model is collection
        if (model instanceof Backbone.Collection) {

            // apply filter
            if (options.filter != void 0) {
                items = _(items).where(options.filter);
            }

            return _syncModel(model, items, options);
        }

        var search = {}, modelId = model.attributes[model.idAttribute];
            search[model.idAttribute] = modelId;

        var item = _(items).findWhere(search);
        if (item == void 0) {
            options.error('Model not found by ID ' + modelId);
            return true;
        }

        return _syncModel(model, item, options);
    }

    function _create(store, model, options) {
        // model.set(model.idAttribute, ++contentCache[store].current);

        var modelData = model.toJSON();
        contentCache[store].items.push(modelData);

        return _syncModel(model, modelData, options);
    }

    function _update(store, model, options) {

        var modelData = model.toJSON();

            contentCache[store].items = _(contentCache[store].items).map(function(item) {
                if (item[model.idAttribute] == modelData[model.idAttribute]) {
                    item = modelData;
                }
                return item;
            });

        return _syncModel(model, modelData, options);
    }

    function _delete(store, model, options) {

        var modelData = model.toJSON();
        contentCache[store].items = _(contentCache[store].items).reject(function(item) {
            return item[model.idAttribute] == model.attributes[model.idAttribute];
        });

        return _syncModel(model, modelData, options);
    }


    /**
     * sync method
     * @params method, model, options
     */
    return function(method, model, options) {

        options         = options           || {};
        options.success = options.success   || function() {};
        options.error   = options.error     || function() {};

        var storeFilename = model.store + '.json';

        var that = this;
        _readFile(storeFilename, options)
            .fail(options.error)
            .done(function() {

                switch(method) {
                    case 'read'  : _read(storeFilename, model, options);   break;
                    case 'create': _create(storeFilename, model, options); break;
                    case 'update': _update(storeFilename, model, options); break;
                    case 'delete': _delete(storeFilename, model, options); break;
                }

                if (method !== 'read') {
                    _writeToFileDebounced(storeFilename, contentCache[storeFilename]);
                }
            });
    };
};
