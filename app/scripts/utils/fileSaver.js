/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
define([
    'q',
    'fileSaver'
], function(Q, fileSaver) {
    'use strict';

    return function(content, fileName) {

        // If it is not Cordova app, use HTML5's saveAs function
        if (!window.cordova) {
            return new Q(fileSaver(content, fileName));
        }

        var defer = Q.defer();

        // Use file plugin API
        window.resolveLocalFileSystemURL(window.cordova.file.externalDataDirectory, function(dir) {
            dir.getFile(fileName, {create: true}, function(file) {
                file.createWriter(function(writer) {
                    writer.write(content);
                    defer.resolve();
                });
            });
        });

        return defer.promise;
    };

});
