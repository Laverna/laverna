/* global define, describe, it */
define([
    'require',
    'chai',
    'libs/tags'
], function (require, chai, TagHelper) {
    'use strict';

    var expect = chai.expect;

    describe('Tag helper', function () {
        var text = 'lorem @Verschlüsselung lipsum @Σημειώσεις. test@example.com';
        var text2 = '@tür, @tieré, @world, @Suédois, @Søk, @Русский, @Holländska, @搜索';

        it('should find @tags', function () {
            var tags = new TagHelper().getTags(text);
            var tags2 = new TagHelper().getTags(text2);

            expect(tags.length).to.be.equal(2);
            expect(tags2.length).to.be.equal(8);
        });
    });

});
