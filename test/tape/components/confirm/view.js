/**
 * Test components/confirm/View.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
// import Radio from 'backbone.radio';
import Mousetrap from 'mousetrap';

import _ from '../../../../app/scripts/utils/underscore';
import View from '../../../../app/scripts/components/confirm/View';

let sand;
test('confirm/View: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('confirm/View: className', t => {
    t.equal(View.prototype.className, 'modal fade');
    t.end();
});

test('confirm/View: events()', t => {
    const events = View.prototype.events();
    t.equal(typeof events, 'object', 'returns an object');
    t.equal(events['click .modal-footer .btn'], 'onBtnClick',
        'calls onBtnClick method if any button in the footer is clicked');

    t.end();
});

test('confirm/View: initialize()', t => {
    const bind = sand.spy(Mousetrap, 'bind');
    const view = new View();
    const stub = sand.stub(view, 'focusNextBtn');

    t.equal(bind.calledWith('tab'), true, 'binds "tab" key');

    Mousetrap.trigger('tab');
    t.equal(stub.called, true, 'calls focusNextBtn method if tab button is clicked');

    sand.restore();
    t.end();
});

test('confirm/View: onBeforeDestroy()', t => {
    const view   = new View();
    const unbind = sand.spy(Mousetrap, 'unbind');
    sand.spy(view, 'onBeforeDestroy');

    view.destroy();
    t.equal(view.onBeforeDestroy.called, true, 'calls onBeforeDestroy method');
    t.equal(unbind.calledWith(['tab']), true, 'unbinds tab key');

    sand.restore();
    t.end();
});

test('confirm/View: onShownModal()', t => {
    const view  = new View();
    const focus = sand.stub();
    sand.stub(view, '$').returns({focus});

    view.onShownModal();
    t.equal(view.$.calledWith('.btn:last'), true,
        'searches for the last button');
    t.equal(focus.called, true, 'makes the last button active');

    sand.restore();
    t.end();
});

test('confirm/View: onBtnClick()', t => {
    const view = new View();
    sand.stub(view, '$').returns({attr: () => 'confirm'});
    sand.stub(view, 'trigger');

    t.equal(view.onBtnClick({currentTarget: '.btn'}), false, 'returns false');
    t.equal(view.$.calledWith('.btn'), true,
        'searches the button that was clicked');
    t.equal(view.trigger.calledWith('answer', {answer: 'confirm'}), true,
        'triggers "answer" event');

    sand.restore();
    t.end();
});

test('confirm/View: focusNextBtn()', t => {
    const view       = new View();
    const focusNext  = sand.stub();
    const focusFirst = sand.stub();
    const next       = sand.stub().returns({focus: focusNext, length: 1});

    sand.stub(view, '$');
    view.$.withArgs('.modal-footer .btn:focus').returns({next});
    view.$.withArgs('.modal-footer .btn:first').returns({focus: focusFirst});

    view.focusNextBtn();
    t.equal(focusNext.called, true,
        'focuses on the button located next to the currently active one');

    next.returns({length: 0});
    view.focusNextBtn();
    t.equal(focusFirst.called, true, 'focuses on the first button');

    sand.restore();
    t.end();
});

test('confirm/View: serializeData()', t => {
    const view = new View({content: 'Test'});
    const res  = view.serializeData();

    t.equal(typeof res, 'object', 'returns an object');
    t.equal(Array.isArray(res.buttons), true, 'returns an array of buttons');
    t.equal(res.content, 'Test', 'returns content');

    t.end();
});

test('confirm/View: templateContext()', t => {
    const context = new View().templateContext();
    sand.stub(_, 'i18n').callsFake(text => text);

    t.equal(context.getTitle.apply({title: 'Test'}), 'Test',
        'uses title from options');
    t.equal(context.getTitle(), 'Are you sure?',
        'uses the default title');

    sand.restore();
    t.end();
});
