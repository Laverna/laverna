exports.command = function(item) {
    this
    .urlHash('notebooks')
    .pause(100)
    .urlHash('notebooks/add')
    .expect.element('#modal .form-group').to.be.visible.before(2000);

    this.perform((client, done) => {
        client.execute(function(filter) {
            var ops = document.querySelectorAll('#modal select[name="parentId"] option');
            for (var i = 0, len = ops.length; i < len; i++) {
                if (filter && ops[i].text.indexOf(filter) > -1) {
                    document
                    .querySelector('#modal select[name="parentId"]')
                    .selectedIndex = ops[i].index;
                }
            }
        }, [item.parentId], function(res) {
            done();
        });
    })

    this.setValue('#modal input[name="name"]', [item.name, this.Keys.ENTER]);

    return this;
};
