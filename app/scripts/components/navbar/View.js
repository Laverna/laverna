/**
 * 
 * @module components/navbar/View
 */
import Mn from 'backbone.marionette';
import Radio from 'backbone.radio';
import _ from 'underscore';
import Sidemenu from '../../behaviors/Sidemenu';

/**
 * Navbar view.
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
	 * Radio channel (components/navbar.)
	 *
	 * @returns {Object}
	 */
    get channel() {
        return Radio.channel('components/navbar');
    }

    /**
	 * Behaviors.
	 *
	 * @see module:behaviors/Sidemenu
	 * @returns {Array}
	 */
    get behaviors() {
        return [Sidemenu];
    }

    ui() {
        return {
            navbar : '#sidebar--nav',
            search : '#header--search--input',
            title  : '#header--title',
            icon   : '#header--icon',
            sync   : '#header--sync--icon',
        };
    }

    events() {
        return {
            'click #header--add--notebook'  : 'navigateAddNotebook',
            'click #header--add--tag'	    : 'navigateAddTag',
            'click #header--about'          : 'showAbout',
            'click #header--sync'           : 'triggerSync',
            'click #header--sbtn'           : 'showSearch',
            'blur @ui.search'               : 'hideSearch',
            'keyup @ui.search'              : 'onSearchKeyup',
            'submit #header--search'        : 'onSearchSubmit',
        };
    }

    initialize() {
        this.listenTo(Radio.channel('utils/Keybindings'), 'appSearch', this.showSearch);

        // Show synchronization status
        this.listenTo(Radio.channel('components/sync'), 'start', this.onSyncStart);
        this.listenTo(Radio.channel('components/sync'), 'stop', this.onSyncStop);

        // Re-render the view if notebooks collection has changed
        this.listenTo(this.options.notebooks, 'change add remove', this.render);
    }

    onDestroy() {
        this.channel.trigger('hidden:search');
    }

    /**
	 * Show a form to either create a note/notebook.
	 *
	 * @fires components/navbar#show:form
	 */
    navigateAdd() {
        // this.channel.trigger('show:form');
        Radio.request('components/notes', 'showForm', {});
    }
	
    /**
	 * Show a form to create a notebook.
	 *
	 * @fires components/navbar#show:form
	 */
    navigateAddNotebook() {
        Radio.request('components/notebooks', 'notebookForm', {});
    }

    /**
	 * Show a form to either create a note/notebook.
	 *
	 * @fires components/navbar#show:form
	 */
    navigateAddTag() {
        Radio.request('components/notebooks', 'tagForm', {});
    }

    /**
	 * Show about page.
	 *
	 * @fires components/help#show:about
	 */
    showAbout() {
        Radio.request('components/help', 'showAbout');
        return false;
    }

    /**
	 * Start synchronizing.
	 *
	 * @fires components/sync#start
	 */
    triggerSync() {
        Radio.request('components/sync', 'start');
    }

    /**
	 * Show search form.
	 *
	 * @fires components/navbar#shown:search
	 */
    showSearch() {
        this.ui.navbar.addClass('-search');
        this.ui.search.focus().select();
        this.channel.trigger('shown:search');
    }

    /**
	 * Hide the search form.
	 */
    hideSearch() {
        this.ui.navbar.removeClass('-search');
    }

    /**
	 * Listen to keyup event that occurs on search input.
	 *
	 * @param {Object} e
	 * @fires components/navbar#hidden:search - after hiding the search form
	 * @fires components/navbar#change:search - on every key input
	 */
    onSearchKeyup(e) {
        // Hide the search bar if it's Esc key
        if (e.which === 27) {
            this.channel.trigger('hidden:search');
            return this.hideSearch();
        }

        this.channel.trigger('change:search', {query: this.ui.search.val().trim()});
    }

    /**
	 * Show search form.
	 *
	 * @fires this#submit:search
	 */
    onSearchSubmit() {
        const query = this.ui.search.val().trim();
        this.hideSearch();

        if (query.length) {
            this.trigger('submit:search', {query});
        }

        this.channel.trigger('hidden:search');
        return false;
    }

    /**
	 * Start spinning the synchronization icon.
	 */
    onSyncStart() {
        this.ui.sync.toggleClass('animate-spin', true);
    }

    /**
	 * Stop spinning the synchronization icon.
	 */
    onSyncStop() {
        this.ui.sync.toggleClass('animate-spin', false);
    }

    /**
	 * Change navbar title.
	 *
	 * @param {Object} options
	 * @param {Object} options.titleOptions
	 * @param {String} options.titleOptions.section
	 */
    onChangeTitle(options) {
        this.options.args = _.extend(this.options.args, options);
        this.ui.title.text(options.titleOptions.section);
    }

    serializeData() {
        const maxNotebooks = Number(this.options.configs.navbarNotebooksMax);

        return _.extend({}, this.options, {
            title     : this.options.args.titleOptions.section,
            notebooks : _.first(this.options.notebooks.toJSON(), maxNotebooks),
        });
    }

    templateContext() {
        return {
            /**
			 * Return true if dropbox synchronization is enabled.
			 *
			 * @returns {Boolean}
			 */
            isSyncEnabled() {
                return ['dropbox', 'p2p'].indexOf(this.configs.cloudStorage) !== -1;
            },
        };
    }

}
