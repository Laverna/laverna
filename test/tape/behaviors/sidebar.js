/**
 * Test behaviors/Sidebar
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Sidebar from '../../../app/scripts/behaviors/Sidebar';

let sand;
test('behaviors/Sidebar: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('behaviors/Sidebar: onDestroy()', t => {
    const side  = new Sidebar();
    side.hammer = {destroy: sand.stub()};

    side.onDestroy();
    t.equal(side.hammer.destroy.called, true, 'destroyes the hammer instance');

    sand.restore();
    t.end();
});

test('behaviors/Sidebar: onSwipeRight()', t => {
    const side = new Sidebar();
    const trig = sand.stub(Radio, 'trigger');

    side.onSwipeRight();
    t.equal(trig.calledWith('components/navbar', 'show:sidemenu'), true,
        'shows the sidebar menu');

    sand.restore();
    t.end();
});

test('behaviors/Sidebar: onSwipeLeft()', t => {
    const side = new Sidebar();
    const req  = sand.stub(Radio, 'request');
    side.view  = {noSwipeLeft: true};

    side.onSwipeLeft();
    t.equal(req.notCalled, true,
        'does nothing if the noSwipeRight property is equal to true');

    side.view.noSwipeLeft = false;
    side.onSwipeLeft();
    t.equal(req.calledWith('Layout', 'toggleContent', {
        visible: true,
    }), true, 'shows content region and hides the sidebar');

    sand.restore();
    t.end();
});
