/**
 * @module components/notes/list/views/NoteView
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';

import ModelFocus from '../../../../behaviors/ModelFocus';

/**
 * Note item view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class NoteView extends Mn.View {

    get template() {
        const tmpl = require('../templates/noteView.html');
        return _.template(tmpl);
    }

    /**
     * Behaviors.
     *
     * @see module:behaviors/ModelFocus
     * @returns {Array}
     */
    behaviors() {
        return [ModelFocus];
    }

    ui() {
        return {
            favorite  : '.favorite',
        };
    }

    events() {
        return {
            'click @ui.favorite': 'toggleFavorite',
        };
    }

    modelEvents() {
        return {
            change         : 'render',
            'change:trash' : 'remove',
        };
    }

    /**
     * Toggle favorite status of a note.
     *
     * @returns {Promise}
     */
    toggleFavorite() {
        this.model.toggleFavorite();
        return Radio.request('collections/Notes', 'saveModel', {model: this.model});
    }

    serializeData() {
        return _.extend({}, this.model.attributes, {
            filterArgs: this.options.filterArgs,
        });
    }

    templateContext() {
        return {
            // Return the first 50 characters of the content
            getContent() {
                return _.unescape(this.content).substring(0, 50);

            },

            getTags() {
                return this.tags;
            },

            // Return the link to a note
            link() {
                return Radio.request('utils/Url', 'getNoteLink', this);
            },

            // Return "active" string if the note is currently active (focused)
            isActive() {
                return this.filterArgs.id === this.id ? 'active' : '';
            },
        };
    }

}
