/* global describe, it */
'use strict';

describe('Load', function() {

    it('shows welcome page', function(client) {
        client
        .urlHash('/notes')
        .expect.element('#welcome--page').to.be.present.before(50000);
    });

    it('closes welcome page', function(client) {
        client
        .click('.modal-header button')
        .expect.element('#welcome--page').not.to.be.present.before(5000);
    });

});
