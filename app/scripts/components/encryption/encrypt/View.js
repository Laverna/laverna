/**
 * @module components/encryption/encrypt/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * Shows encryption/decryption process.
 *
 * @class
 * @extends Marionette.Object
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

    triggers() {
        return {
            'click #btn--proceed': 'proceed',
        };
    }

    ui() {
        return {
            proceed     : '#container--encryption--proceed',
            progress    : '#container--encryption--progress',
            progressBar : '#progress',
        };
    }

    serializeData() {
        const encrypt = Number(this.options.configs.encrypt);
        return _.extend({}, this.options.configs, {
            title: _.i18n(encrypt ? 'Encrypting' : 'Decrypting'),
        });
    }

    /**
     * Show the progress bar and hide the proceed button.
     */
    showProgress() {
        this.ui.proceed.addClass('hide');
        this.ui.progress.removeClass('hide');
    }

    /**
     * Change progress bar status.
     *
     * @param {Number} count
     * @param {Number} max
     */
    changeProgress({count, max}) {
        const width = Math.floor((count * 100) / max);
        this.ui.progressBar.css('width', `${width}%`);
    }

}
