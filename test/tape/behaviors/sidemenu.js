/**
 * Test behaviors/Sidemenu.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Mn from 'backbone.marionette';
import Mousetrap from 'mousetrap';

import Sidemenu from '../../../app/scripts/behaviors/Sidemenu';

class View extends Mn.View {

    get channel() {
        return Radio.channel('test/view');
    }

    get behaviors() {
        return [Sidemenu];
    }

}

let sand;
test('behaviors/Sidemenu: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('behaviors/Sidemenu: ui()', t => {
    const ui = Sidemenu.prototype.ui();
    t.equal(typeof ui, 'object');
    t.equal(ui.sidemenu, '.sidemenu');
    t.end();
});

test('behaviors/Sidemenu: events()', t => {
    const events = Sidemenu.prototype.events();
    t.equal(typeof events, 'object');
    t.equal(events['click .sidemenu--open'], 'showMenu',
        'shows the menu if the hamburger icon is clicked');
    t.equal(events['click .sidemenu--close'], 'hideMenu',
        'hides the menu if the close button is clicked');
    t.equal(events['click .sidemenu a'], 'hideMenu',
        'hides the menu if any link is clicked');
    t.end();
});

test('behaviors/Sidemenu: initialize()', t => {
    const menu   = Sidemenu.prototype;
    const listen = sand.stub(menu, 'listenTo');
    const view   = new View();

    t.equal(listen.calledWith(view.channel, 'show:sidemenu', menu.showMenu), true,
        'shows the menu on show:sidemenu event triggered on the view radio channel');

    const channel = Radio.channel('utils/Keybindings');
    t.equal(listen.calledWith(channel, 'appShowSidemenu', menu.showMenu), true,
        'shows the menu on appShowSidemenu event triggered on utils/Keybindings channel');

    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: onDestroy()', t => {
    Sidemenu.prototype.hammer  = {destroy: sand.stub()};
    Sidemenu.prototype.hammer2 = {destroy: sand.stub()};
    const view = new View();

    view.destroy();
    t.equal(Sidemenu.prototype.hammer.destroy.called, true,
        'stops listening to hammer events');
    t.equal(Sidemenu.prototype.hammer2.destroy.called, true,
        'stops listening to hammer events');

    sand.restore();
    delete Sidemenu.prototype.hammer;
    delete Sidemenu.prototype.hammer2;
    t.end();
});

test('behaviors/Sidemenu: onRender()', t => {
    const menu = Sidemenu.prototype;
    const stub = sand.stub(menu, 'listenToHammer');

    menu.onRender();
    t.equal(typeof menu.$backdrop, 'object', 'creates $backdrop property');
    t.equal(stub.called, true, 'starts listening to Hammer events');

    sand.restore();
    t.end();
});

/**
 * @todo
 */
test('behaviors/Sidemenu: listenToHammer()', t => {
    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: showMenu()', t => {
    const menu   = Sidemenu.prototype;
    const uiBack = menu.ui;
    menu.ui      = {sidemenu: {addClass: sand.stub(), scrollTop: sand.stub()}};
    menu.$backdrop = {addClass: sand.stub(), on: sand.stub()};
    sand.spy(Mousetrap, 'bind');

    t.equal(menu.showMenu(), false, 'returns false');

    t.equal(menu.ui.sidemenu.addClass.calledWith('-show'), true, 'shows the menu');
    t.equal(menu.$backdrop.addClass.calledWith('-show'), true, 'shows the backdrop');
    t.equal(menu.ui.sidemenu.scrollTop.calledWith(0), true,
        'resets the scroll position');
    t.equal(menu.$backdrop.on.calledWith('click'), true,
        'hides the menu if the backdrop is clicked');

    t.equal(Mousetrap.bind.calledWith('esc'), true, 'binds Escape key');
    sand.stub(menu, 'hideMenu');
    Mousetrap.trigger('esc');
    t.equal(menu.hideMenu.called, true, 'hides the menu on Escape');

    delete menu.$backdrop;
    menu.ui = uiBack;
    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: onBackdropClick()', t => {
    const menu     = Sidemenu.prototype;
    menu.$backdrop = {off: sand.stub()};
    sand.stub(menu, 'hideMenu');

    menu.onBackdropClick();
    t.equal(menu.hideMenu.called, true, 'hides the menu');
    t.equal(menu.$backdrop.off.calledWith('click'), true,
        'stops listening to click event');

    delete menu.$backdrop;
    sand.restore();
    t.end();
});

test('behaviors/Sidemenu: hideMenu()', t => {
    const menu     = Sidemenu.prototype;
    const uiBack   = menu.ui;
    menu.ui        = {sidemenu: {removeClass: sand.stub()}};
    menu.$backdrop = {removeClass: sand.stub()};

    menu.hideMenu();
    t.equal(menu.ui.sidemenu.removeClass.calledWith('-show'), true,
        'removes -show class from the menu');
    t.equal(menu.$backdrop.removeClass.calledWith('-show'), true,
        'removes -show class from the backdrop');

    const e = {
        preventDefault : sand.stub(),
        currentTarget  : {hasClass: sand.stub().returns(true)},
    };
    menu.hideMenu(e);
    t.equal(e.preventDefault.called, true,
        'prevents the default behavior the current target is not a link');

    sand.restore();
    menu.ui = uiBack;
    delete menu.$backdrop;
    t.end();
});
