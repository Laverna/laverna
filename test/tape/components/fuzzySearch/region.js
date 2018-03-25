/**
 * Test components/fuzzySearch/views/Region
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import '../../../../app/scripts/utils/underscore';

import Region from '../../../../app/scripts/components/fuzzySearch/views/Region';

let sand;
test('fuzzySearch/views/Region: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('fuzzySearch/views/Region: onShow()', t => {
    const prot = Region.prototype;
    prot.$body = {addClass   : sand.stub()};
    prot.$el   = {removeClass: sand.stub()};

    prot.onShow();
    t.equal(prot.$body.addClass.calledWith('-fuzzy'), true,
        'adds -fuzzy class to the body');
    t.equal(prot.$el.removeClass.calledWith('hidden'), true,
        'shows the region element');

    prot.$body = null;
    prot.$el   = null;
    sand.restore();
    t.end();
});

test('fuzzySearch/views/Region: onEmpty()', t => {
    const prot = Region.prototype;
    prot.$body = {removeClass: sand.stub()};
    prot.$el   = {addClass   : sand.stub()};

    prot.onEmpty();
    t.equal(prot.$el.addClass.calledWith('hidden'), true,
        'hides the region element');
    t.equal(prot.$body.removeClass.calledWith('-fuzzy'), true,
        'removes -fuzzy class from the body');

    prot.$body = null;
    prot.$el   = null;
    sand.restore();
    t.end();
});
