'use strict';
exports.command = function(item) {
    this
    .urlHash('notes/add')
    .expect.element('#editor--input--title').to.be.visible.before(50000);

    this
    .setValue('#editor--input--title', item.title)
    .expect.element('#editor--input--title').value.to.contain(item.title).before(2000);

    this
    .click('.ace_content')
    .keys([item.content]);

    this
    .click('.editor--save')
    .expect.element('.layout--body.-form').not.to.be.present.before(2000);

    return this;
};
