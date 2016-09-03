'use strict';
/**
 * This Nightwatch command changes encryption settings.
 */
exports.command = function(data) {
    this
    .urlHash('settings/encryption')
    .expect.element('.-tab-encryption').to.be.present.before(5000);

    this.getAttribute('input[name=encrypt]', 'checked', function(res) {
        if (data.use && res.value === null) {
            this.click('input[name="encrypt"]');
        }
    });

    this
    .clearValue('input[name="encryptPass"]')
    .setValue('input[name="encryptPass"]', data.password)
    .click('#randomize')
    .click('.settings--save')
    .pause(1000)
    .click('.settings--cancel');

    return this;
};
