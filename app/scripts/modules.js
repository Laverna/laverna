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
