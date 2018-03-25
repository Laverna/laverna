/**
 * Test behaviors/Content
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Hammer from 'hammerjs';

import Content from '../../../app/scripts/behaviors/Content';

let sand;
test('behaviors/Content: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('behaviors/Content: events()', t => {
    const events = Content.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click #show--sidebar'], 'showSidebar',
        'shows the sidebar if the button is clicked');

    t.end();
});

test('behaviors/Content: onDestroy()', t => {
    const content   = new Content();
    content.$active = {off: sand.stub()};
    content.hammer  = {destroy: sand.stub()};
    sand.stub(content, 'showSidebar');

    content.onDestroy();
    t.equal(content.$active.off.calledWith('click'), true, 'msg');
    t.equal(content.hammer.destroy.called, true, 'destroyes the hammer instance');
    t.equal(content.showSidebar.called, true, 'shows the sidebar');

    sand.restore();
    t.end();
});

test('behaviors/Content: onRender()', t => {
    const con = new Content();
    sand.stub(con, 'showContent');
    sand.stub(con, 'listenToHammer');
    sand.stub(con, 'listenActive');

    con.onRender();
    t.equal(con.showContent.called, true, 'shows content region');
    t.equal(con.listenToHammer.called, true, 'starts listening to touch events');
    t.equal(con.listenActive.called, true, 'calls listenActive method');

    sand.restore();
    t.end();
});

test('behaviors/Content: showSidebar() + showContent()', t => {
    const con = new Content();
    const req = sand.stub(Radio, 'request');

    con.showSidebar();
    t.equal(req.calledWith('Layout', 'toggleContent', {
        visible: false,
    }), true, 'hides content and show the sidebar');

    con.showContent();
    t.equal(req.calledWith('Layout', 'toggleContent', {
        visible: true,
    }), true, 'hides sidebar and show content');

    sand.restore();
    t.end();
});
