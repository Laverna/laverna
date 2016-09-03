exports.command = function(selector, attr, callback) {
    this.execute(function(selector, attr) {
        var els = document.querySelectorAll(selector),
            param = [];

        for (var i = 0, len = els.length; i < len; i++) {
            if (attr) {
                param.push(els[i].getAttribute(attr));
            } else {
                param.push(els[i]);
            }
        }

        return param;
    }, [selector, attr], function(res) {
        callback(res.value);
    });

    return this;
};
