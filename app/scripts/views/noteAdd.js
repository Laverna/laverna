/*global define*/
define([
    'marionette',
    'underscore',
    'text!templates/notes/add.html'
], function(Marionette, _, Template){
    var View = Marionette.ItemView.extend({
        template: _.template(Template),
    });
    return View;
});
