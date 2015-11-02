/* global describe, before, it */
'use strict';

describe('#/notes/add', function() {
    var browser;

    before(function() {
        browser = this.browser;

        return browser
        .get('http://localhost:9000/#notes/add');
    });

    it('removes loader', function() {
        return browser.waitForConditionInBrowser('document.querySelectorAll("#layout--brand *").length === 0', 10000);
    });

});
