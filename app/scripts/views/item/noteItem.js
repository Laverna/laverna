/*global define */
define(['underscore', 'marionette', 'text!noteItemTempl', 'showdown', 'checklist', 'prettify'],
function (_, Marionette, Template, Showdown, Checklist, prettify) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'content-notes',

        events: {
            'click .favorite': 'favorite'
        },

        initialize: function() {
            this.model.on('change', this.render);
            this.listenTo(this.model, 'change', this.changeFocus);
        },

        onRender: function () {
            // Google code prettify
            var code = null;
            this.$('pre').addClass('prettyprint').each(function (idx, el) {
                code = el.firstChild;
                code.innerHTML = prettify.prettyPrintOne(code.innerHTML);
            });
        },

        changeFocus: function() {
            $('#sidebar #note-' + this.model.get('id')).addClass('active');
        },

        favorite: function() {
            var isFavorite = (this.model.get('isFavorite') === 1) ? 0 : 1;
            this.model.save({'isFavorite': isFavorite});
        },

        templateHelpers: function() {
            return {
                getProgress: function(taskCompleted, taskAll) {
                    return taskCompleted * 100 / taskAll;
                },
                getContent: function(text) {
                    text = new Checklist().parse(text);
                    var converter = new Showdown.converter();
                    return converter.makeHtml(text);
                }
            };
        }
    });

    return View;
});
