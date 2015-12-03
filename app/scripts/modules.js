/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette'
], function(_, Marionette) {
    'use strict';

    /**
     * This class is used to create modules without requiring app.js
     */
    var Modules = Marionette.Object.extend({
        initialize: function() {
            this.submodules = {};
        },

        module: function(moduleName, moduleDefinition) {
            // Overwrite the module class if the user specifies one
            var ModuleClass = Marionette.Module.getClass(moduleDefinition),
                args = _.toArray(arguments);

            args.unshift(this);

            // see the Marionette.Module object for more information
            return ModuleClass.create.apply(ModuleClass, args);
        },

        addInitializer: function() {}
    });

    return new Modules();
});
