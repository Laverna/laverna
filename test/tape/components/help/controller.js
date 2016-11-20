/**
 * Test components/help/controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import controller from '../../../../app/scripts/components/help/controller';
import About from '../../../../app/scripts/components/help/about/Controller';

let sand;
test('help/controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('help/controller: init()', t => {
    const reply = sand.stub(Radio, 'reply');

    controller.init();
    t.equal(reply.calledWith('components/help', {
        showAbout       : controller.showAbout,
        showFirstStart  : controller.showFirstStart,
        showKeybindings : controller.showKeybindings,
    }, controller), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('help/controller: showAbout', t => {
    const init = sand.stub(About.prototype, 'init');

    controller.showAbout();
    t.equal(init.called, true, 'shows about page');

    sand.restore();
    t.end();
});
