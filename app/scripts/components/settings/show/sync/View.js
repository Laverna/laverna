/**
 * @module components/settings/show/sync/View
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import Behavior from '../Behavior';
// import constants from '../../../../constants';
import Users from './Users';

/**
 * Sync settings view.
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

    /**
     * Behaviors.
     *
     * @see module:components/settings/show/Behavior
     * @returns {Array}
     */
    get behaviors() {
        return [Behavior];
    }

    regions() {
        return {
            content: '#sync--content',
        };
    }

    ui() {
        return {
            sync: '[name=cloudStorage]',
        };
    }

    events() {
        return {
            'change @ui.sync': 'showSyncView',
        };
    }

    onRender() {
        this.showSyncView();
    }

    /**
     * Show a sync adapter view.
     */
    showSyncView() {
        const sync = this.ui.sync.val().trim();

        if (sync === 'p2p') {
            return this.showUsers();
        }

        this.showSync(sync);
    }

    /**
     * Show a list of users whom you trust.
     */
    showUsers() {
        this.showChildView('content', new Users({
            collection: this.options.users,
        }));
    }

    /**
     * Request the settings view from the sync adapter.
     *
     * @param {String} name
     */
    showSync(name) {
        const ViewS = Radio.request(`components/${name}`, 'getSettingsView');

        // If the adapter doesn't have the settings view, just empty the region
        if (!ViewS) {
            return this.getRegion('content').empty();
        }

        this.showChildView('content', new ViewS({collection: this.collection}));
    }

    serializeData() {
        return {
            models: this.collection.getConfigs(),
        };
    }

}
