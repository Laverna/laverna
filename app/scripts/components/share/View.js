/**
 * @module components/share/View
 */
import _ from 'underscore';
import Mn from 'backbone.marionette';
import Users from './users/View';
import Info from './info/View';

/**
 * Share view.
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

    regions() {
        return {
            content: '#share--content',
        };
    }

    ui() {
        return {
            search    : '[name=search]',
            formField : '.share--fieldset',
            userError : '.share--user--error',
            back      : '.share--back',
        };
    }

    events() {
        return {
            'click @ui.back': 'showUsers',
        };
    }

    triggers() {
        return {
            'submit .share--search': 'search:user',
        };
    }

    /**
     * Show a list of trusted users.
     */
    onRender() {
        this.showUsers();
    }

    onShownModal() {
        this.ui.search.focus();
    }

    /**
     * Show a list of users whom the user trusts.
     */
    showUsers() {
        this.showChildView('content', new Users({
            model      : this.options.model,
            collection : this.options.users,
        }));
        this.ui.back.addClass('hidden');
    }

    /**
     * Disable the search form.
     *
     * @param {Boolean} disabled
     */
    onSearch({disabled}) {
        this.ui.search.val('');
        this.ui.formField.attr('disabled', disabled);
    }

    /**
     * Show a warning that a user does not exist
     */
    onUserError() {
        this.ui.userError.removeClass('hidden');
    }

    /**
     * Show information about a user.
     *
     * @param {Object} data
     * @param {Object} data.user
     */
    showUserInfo(data) {
        this.showChildView('content', new Info(data));
        this.ui.back.removeClass('hidden');
        this.ui.userError.addClass('hidden');
    }

}
