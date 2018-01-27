/**
 * Test components/help/keybindings/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

/* eslint-disable */
import Configs from '../../../../../app/scripts/collections/Configs';
import Controller from '../../../../../app/scripts/components/help/keybindings/Controller';
/* eslint-enable */

let sand;
test('help/keybindings/controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('help/keybindings/Controller: init()', t => {
    const con  = new Controller();
    sand.stub(con, 'show');

    sand.stub(Radio, 'request')
    .withArgs('collections/Configs', 'find')
    .resolves('configs');

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.show.calledWith('configs'), true,
            'renders the view');

        sand.restore();
        t.end();
    });
});

test('help/keybindings/Controller: show()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');
    const req    = sand.stub(Radio, 'request');
    const stub   = sand.stub(Configs.prototype, 'keybindings');

    con.show(new Configs());
    t.equal(stub.called, true, 'filter the collection to show only keybindings');
    t.equal(req.calledWith('Layout', 'show', {
        region : 'modal',
        view   : con.view,
    }), true, 'renders the view in modal region');

    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');

    sand.restore();
    t.end();
});
