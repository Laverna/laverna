'use strict';

exports.command = function(item) {
    this
    .urlHash('notebooks')
    .pause(100)
    .urlHash('tags/add')
    .expect.element('#modal .form-group').to.be.present.before(5000);

    // this.expect.element('#modal .form-group').to.be.visible.before(5000);

    this.setValue('#modal input[name="name"]', [item.name, this.Keys.ENTER]);

    return this;
};
