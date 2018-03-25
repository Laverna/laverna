/**
 * Test components/help/about/Controller
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Controller from '../../../../../app/scripts/components/help/about/Controller';

let sand;
test('help/about/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('help/about/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'show');
    con.init();
    t.equal(con.show.called, true, 'calls show method');

    sand.restore();
    t.end();
});

test('help/about/Controller: show()', t => {
    const con    = new Controller();
    const req    = sand.stub(Radio, 'request');
    const listen = sand.stub(con, 'listenTo');

    con.show();
    t.equal(req.calledWith('Layout', 'show', {
        region : 'modal',
        view   : con.view,
    }), true, 'renders the view in modal region');
    t.equal(listen.calledWith(con.view, 'destroy', con.destroy), true,
        'destroyes itself if the view is destroyed');

    sand.restore();
    t.end();
});
