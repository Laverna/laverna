/**
 * @module components/help/firstStart/View
 */
import Mn from 'backbone.marionette';
import _ from 'underscore';

/**
 * First start help view.
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
        return 'modal fade';
    }

    ui() {
        return {
            settings     : '#welcome--settings',
            page         : '#welcome--page',
            backup       : '#welcome--backup',
            password     : 'input[name="password"]',
            cloudStorage : 'select[name="cloudStorage"]',
        };
    }

    triggers() {
        return {
            'click #welcome--import' : 'import',
            'click #welcome--save'   : 'save',
            'click #welcome--export' : 'download',
        };
    }

    events() {
        return {
            'click #welcome--next': 'onNext',
            'click #welcome--last': 'destroy',
        };
    }

    /**
     * Show settings page after a user clicks on "next" button.
     */
    onNext() {
        this.ui.page.addClass('hidden');
        this.ui.settings.removeClass('hidden');
    }

    /**
     * After saving settings, show backup buttons.
     */
    onSaveAfter() {
        this.ui.settings.addClass('hidden');
        this.ui.backup.removeClass('hidden');
    }

}
