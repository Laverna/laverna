'use strict';

/**
 * Notebook list test
//  |)}>#
module.exports = {

    before: function(client) {
        client.closeWelcome();

        client.urlHash('settings/importExport');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(50000);
    },

    after: function(client) {
        client.end();
    },

    '"Import & Export" tab is active in #/settings/importExports': function(client) {
        client
        .expect.element('.list--settings.active').to.have.text.that.contains('Import & Export');
    },

    // @TODO Test importing & exporting json config files
};
*/
