'use strict';
exports.command = function(item) {
    this
    .urlHash('notes/add')
    .expect.element('#editor--input--title').to.be.visible.before(50000);

    this
    .setValue('#editor--input--title', item.title)
    .expect.element('#editor--input--title').value.to.contain(item.title).before(2000);

    this
    .click('.CodeMirror-lines')
    .keys(item.content);

    if (item.notebook) {
        this
        .click('.addNotebook')
        .expect.element('.modal--input[name=name]').to.be.visible.before(1000);

        this
        .setValue('.modal--input[name=name]', [item.notebook, this.Keys.ENTER])
        .pause(1000);
    }

    this
    .click('.editor--save')
    .expect.element('.layout--body.-form').not.to.be.present.before(2000);

    return this;
};
