/* global define */
define([
    'underscore',
    'marionette'
], function(_, Marionette) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template : _.template('{{name}}'),
        tagName  : 'option',

        onRender : function() {
            this.$el.attr('value', this.model.get('id'));
        }
    });

    return View;
});
