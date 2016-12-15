/**
 * Test views/Brand
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import Brand from '../../../app/scripts/views/Brand';
const brand = Brand.prototype;

let sand;
test('views/Brand: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('views/Brand: onShow()', t => {
    brand.$el = {slideDown: sand.stub()};

    brand.onShow();
    t.equal(brand.$el.slideDown.calledWith('fast'), true,
        'shows the region with animation');

    brand.$el = null;
    t.end();
});

test('views/Brand: onEmpty()', t => {
    brand.$el = {slideUp: sand.stub()};

    brand.onEmpty();
    t.equal(brand.$el.slideUp.calledWith('fast'), true,
        'hides the region with animation');

    brand.$el = null;
    t.end();
});
