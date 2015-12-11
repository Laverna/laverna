'use strict';
var keys;

/**
 * Notebook list test
//  |)}>#
module.exports = {

    before: function(client) {
        client.closeWelcome();

        keys = {
            actionsEdit: 'e',
            actionsOpen: 'o',
            actionsRemove: 'shift+3',
            actionsRotateStar: 's',
            appCreateNote: 'c',
            // appKeyboardHelp: '?',
            // appSearch: '/',
            jumpFavorite: 'g f',
            jumpInbox: 'g i',
            jumpNotebook: 'g n',
            jumpOpenTasks: 'g o',
            jumpRemoved: 'g t',
            navigateBottom: 'j',
            navigateTop: 'k',
        };

        client.urlHash('settings/keybindings');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(50000);
    },

    after: function(client) {
        client.end();
    },

    'keybindings tab is active in #/settings/keybindings': function(client) {
        client
        .expect.element('.list--settings.active').to.have.text.that.contains('Keybindings');
    },

    'can change keybindings': function(client) {
        client.perform(function(client, done) {
            for (var name in keys) {
                client
                .expect.element('[name="' + name + '"]').to.be.present.before(5000);

                client
                .clearValue('[name="' + name + '"]')
                .setValue('[name="' + name + '"]', keys[name].toUpperCase());
            }

            client
            .clearValue('[name="appKeyboardHelp"]')
            .setValue('[name="appKeyboardHelp"]', '/');

            client
            .clearValue('[name="appSearch"]')
            .setValue('[name="appSearch"]', '?');

            client.perform(() => {done();});
        });
    },

    'keybindings are saved': function(client) {
        client.click('.settings--save');
        client.click('.settings--cancel');

        client.expect.element('#header--add').to.be.visible.before(50000);
        client.urlHash('settings/keybindings');
        client.expect.element('.header--title').to.have.text.that.contains('Settings').before(5000);

        client.perform(function(client, done) {
            for (var name in keys) {
                client.assert.value('[name="' + name + '"]', keys[name].toUpperCase());
            }

            client.assert.value('[name="appKeyboardHelp"]', '/');
            client.assert.value('[name="appSearch"]', '?');

            client.perform(() => {done();});
        });
    },

    'change to old settings': function(client) {
        client.perform(function(client, done) {
            for (var name in keys) {
                client
                .clearValue('[name="' + name + '"]')
                .setValue('[name="' + name + '"]', keys[name].toUpperCase());
            }

            client
            .clearValue('[name="appKeyboardHelp"]')
            .setValue('[name="appKeyboardHelp"]', '/');

            client
            .clearValue('[name="appSearch"]')
            .setValue('[name="appSearch"]', '?');

            client.perform(() => {done();});
        });

        client.click('.settings--save');
        client.click('.settings--cancel');

        client.expect.element('#header--add').to.be.visible.before(50000);
    },
};
*/
