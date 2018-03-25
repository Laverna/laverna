/**
 * @module components/importExport/migrate/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * Migrate view.
 *
 * @class
 * @extends Marionette.View
 * @license MPL-2.0
 */
export default class View extends Mn.View {

    get template() {
        const tmpl = require('./template.html');
        return _.template(tmpl);
    }

    get className() {
        return 'container text-center -auth';
    }

    ui() {
        return {
            confirm      : '#migrate--confirm',
            progress     : '#migrate--progress',
            progressBar  : '.migrate--progress--bar',
            progressText : '.migrate--progress--text',
            password     : '[name=password]',
            alert        : '#migrate--alert',
            alertText    : '#migrate--alert .alert',
        };
    }

    triggers() {
        return {
            'click #migrate--cancel' : 'cancel',
            'click #migrate--start'  : 'start',
        };
    }

    serializeData() {
        return this.options;
    }

    /**
     * Show a message that something went wrong.
     *
     * @param {String} text
     */
    showAlert(text) {
        this.ui.alert.removeClass('hidden');
        this.ui.alertText.text(_.i18n(text));
    }

    onAuthFailure() {
        this.showAlert('Wrong password!');
    }

    /**
     * After migration starts, show the progress bar.
     */
    onMigrateStart() {
        this.ui.alert.addClass('hidden');
        this.ui.confirm.addClass('hidden');
        this.ui.progress.removeClass('hidden');
    }

    /**
     * Show a message that a collection is being restored to the new version.
     *
     * @param {String} type
     * @param {Number} percent
     */
    onMigrateCollection({type, percent}) {
        this.ui.progressBar.css({width: `${percent}%`});
        this.ui.progressText.text(_.i18n(`Migrating ${type}`));
    }

    onMigrateFailure() {
        this.showAlert('Failed to migrate your old data!');
    }

}
