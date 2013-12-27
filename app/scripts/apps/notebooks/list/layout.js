/*global define */
define([
    'underscore',
    'app',
    'marionette',
    'text!apps/notebooks/list/templates/layout.html',
    'backbone.mousetrap'
], function (_, App, Marionette, Templ) {
    'use strict';

    // Initializing mousetrap
    _.extend(Marionette.Layout, Backbone.View);

    var Layout = Marionette.Layout.extend({
        template: _.template(Templ),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },
        
        keyboardEvents: {
        },

        initialize: function () {
            this.keyboardEvents[App.settings.navigateBottom] = 'nextOrPrev';
            this.keyboardEvents[App.settings.navigateTop] = 'nextOrPrev';

            // Navigation events
            this.on('notebooks:navigate', this.navigateNotebooks);
            this.on('tags:navigate', this.navigateTags);
        },

        nextOrPrev: function (navigate) {
            var active = this.$el.find('.list-group-item.active'),
                activeParent,
                activeId;

            if (active.length === 0) {
                this.trigger('notebooks:navigate', {active : 0});
            } else {
                activeParent = active.parent();
                activeId = parseInt(active.attr('data-id'));

                // Only notebooks has childrens
                if (activeParent.children('.tags').length !== 0) {
                    console.log(activeParent.children('.tags'));
                    this.trigger('notebooks:navigate', {
                        active: activeId,
                        navigate: navigate
                    });
                } else {
                    this.trigger('tags:navigate', {
                        active: activeId,
                        navigate: navigate
                    });
                }
            }

            active.removeClass('active');
        },

        /**
         * Tags navigation
         */
        navigateTags: function (opts) {
            console.log(opts);
            var notebook,
                el;

            if (opts.active !== 0) {
                notebook = this.options.tags.navigate(opts.active, opts.navigate);
            } else {
                notebook = this.options.tags.at(0);
            }

            el = this.$('#tags a[data-id=' + notebook.get('id') + ']');
            el.addClass('active');
        },

        /**
         * Notebooks navigation
         */
        navigateNotebooks: function (opts) {
            var notebook,
                el;

            if (opts.active !== 0) {
                notebook = this.options.notebooks.navigate(opts.active, opts.navigate);
            } else {
                notebook = this.options.notebooks.at(0);
            }

            if (notebook !== null) {
                el = this.$('#notebooks a[data-id=' + notebook.get('id') + ']');
                el.addClass('active');
            } else {
                this.trigger('tags:navigate', {active: 0});
            }
        }

    });

    return Layout;
});
