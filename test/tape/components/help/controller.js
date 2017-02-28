/**
 * Test components/help/controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import controller from '../../../../app/scripts/components/help/controller';
import About from '../../../../app/scripts/components/help/about/Controller';
import Keybindings from '../../../../app/scripts/components/help/keybindings/Controller';
/* eslint-enable */

let sand;
test('help/controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('help/controller: init()', t => {
    const reply = sand.stub(Radio, 'reply');
    const on    = sand.stub(Radio, 'on');

    controller.init();
    t.equal(reply.calledWith('components/help', {
        showAbout       : controller.showAbout,
        showKeybindings : controller.showKeybindings,
    }, controller), true, 'starts replying to requests');

    t.equal(on.calledWith('utils/Keybindings', 'appKeyboardHelp'), true,
        'shows keybinding help if "?" key is pressed');

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

test('help/controller: showKeybindings', t => {
    const init = sand.stub(Keybindings.prototype, 'init');

    controller.showKeybindings();
    t.equal(init.called, true, 'shows keybindings page');

    sand.restore();
    t.end();
});
