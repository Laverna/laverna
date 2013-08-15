/*global define*/
define(['marionette'], function(Marionette){
    var Controller = Marionette.Controller.extend({
        index: function(){
            console.log('index page');
        }
    });
    return Controller;
});
