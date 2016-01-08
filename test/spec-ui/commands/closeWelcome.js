'use strict';

exports.command = function() {
    this
    .urlHash('/notes')
    .expect.element('#welcome--page').to.be.present.before(100000);

    this
    .expect.element('.modal-header .close').to.be.present.before(5000);

    this
    .click('.modal-header .close')
    .keys(this.Keys.ESCAPE)
    .expect.element('#welcome--page').not.to.be.present.before(10000);

    return this;
};
