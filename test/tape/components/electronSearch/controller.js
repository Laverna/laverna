/**
 * Test components/electronSearch/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Mousetrap from 'mousetrap';
import '../../../../app/scripts/utils/underscore';

import Controller from '../../../../app/scripts/components/electronSearch/Controller';
import View from '../../../../app/scripts/components/electronSearch/View';

let sand;
test('electronSearch/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('electronSearch/Controller: region', t => {
    t.equal(Controller.prototype.region, 'module--electronSearch');
    t.end();
});

test('electronSearch/Controller: constructor()', t => {
    const req  = sand.stub(Radio, 'request');
    const bind = sand.stub(Mousetrap, 'bind');

    new Controller();
    t.equal(req.calledWith('Layout', 'add', {
        region: 'module--electronSearch',
        html  : true,
    }), true, 'creates a new region');

    t.equal(bind.calledWith(['ctrl+f', 'command+f']), true,
        'binds keyboard shortcuts');

    sand.restore();
    t.end();
});

test('electronSearch/Controller: init()', t => {
    const req = sand.stub(Radio, 'request');
    const preventDefault = sand.stub();
    window.requireNode   = sand.stub().returns({});
    const trigger        = sand.stub(View.prototype, 'triggerMethod');

    const con = new Controller();
    con.init({preventDefault});

    t.equal(preventDefault.called, true, 'prevents the default behavior');
    t.equal(req.calledWith('Layout', 'show', {
        region : con.region,
        view   : con.view,
    }), true, 'renders the view in electronSearch search region');
    t.equal(trigger.calledWith('ready'), true, 'triggers "ready" event');

    window.requireNode = null;
    sand.restore();
    t.end();
});
