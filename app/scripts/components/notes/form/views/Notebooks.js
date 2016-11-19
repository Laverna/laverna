/**
 * @module components/notes/form/views/Notebooks
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';
import Radio from 'backbone.radio';

import NotebooksCollection from './NotebooksCollection';

/**
 * Notebooks selector view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class Notebooks extends Mn.View {

    get template() {
        const tmpl = require('../templates/notebooks.html');
        return _.template(tmpl);
    }

    regions() {
        return {
            list: {
                el: '.editor--notebooks--select',
                replaceElement: true,
            },
        };
    }

    ui() {
        return {
            notebookId: '[name="notebookId"]',
        };
    }

    events() {
        return {
            'change @ui.notebookId': 'addNotebook',
        };
    }

    /**
     * Render the collection view.
     */
    onRender() {
        this.showChildView('list', new NotebooksCollection(this.options));
        this.selectModel({id: this.options.notebookId});
    }

    /**
     * Select the model.
     *
     * @param {Object} model - notebook model
     */
    selectModel(model) {
        this.ui.notebookId.val(model.id);
    }

    /**
     * Add a new notebook.
     *
     * @returns {Promise}
     */
    addNotebook() {
        // Add a new notebook only if add notebook option is selected
        if (!this.ui.notebookId.find('.addNotebook').is(':selected')) {
            return;
        }

        this.ui.notebookId.val(this.options.notebookId);
        return Radio.request('components/notebooks', 'notebookForm', {
            profileId: this.collection.profileId,
        })
        .then(data => {
            if (data.model) {
                this.selectModel(data.model);
            }
        });
    }

}
