/**
 * Test components/confirm/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import Controller from '../../../../app/scripts/components/confirm/Controller';
// import View from '../../../../app/scripts/components/confirm/View';

let sand;
test('confirm/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('confirm/Controller: channel', t => {
    const channel = Controller.prototype.channel;
    t.equal(typeof channel, 'object');
    t.equal(channel.channelName, 'components/confirm');
    t.end();
});

test('confirm/Controller: constructor()', t => {
    const reply = sand.stub(Controller.prototype.channel, 'reply');
    const con   = new Controller();

    t.equal(reply.calledWith({
        show: con.init,
    }, con), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('confirm/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'show').callsFake((opt, promise) => {
        promise.resolve();
    });

    const res = con.init({content: 'Test'});
    t.equal(typeof res.then, 'function', 'returns a promise');

    res.then(() => {
        t.equal(con.show.calledWith({content: 'Test'}), true,
            'calls "init" method');

        sand.restore();
        t.end();
    });
});

test('confirm/Controller: show()', t => {
    const con = new Controller();
    const req = sand.stub(Radio, 'request');
    req.withArgs('components/markdown').returns(Promise.resolve('Test!'));
    req.withArgs('Layout').returns('');
    sand.stub(con, 'listenToView');

    const promise = {resolve: sand.stub(), reject: sand.stub()};
    const res     = con.show({content: 'Test'}, promise);
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(req.calledWith('components/markdown', 'render', {
        content: 'Test',
    }), true, 'converts the content to Markdown');

    res.then(() => {
        t.equal(req.calledWithMatch('Layout', 'show', {
            region: 'modal',
        }), true, 'renders confirm view');

        t.equal(con.listenToView.called, true,
            'starts listening to view events');

        sand.restore();
        t.end();
    });
});

test('confirm/Controller: listenToView()', t => {
    const con    = new Controller();
    const listen = sand.stub(con, 'listenTo');

    const data = {view: {el: 'test'}, promise: {resolve: 'OK'}};
    con.listenToView(data);
    t.equal(listen.calledWith(data.view, 'answer'), true,
        'listens to "answer" event');
    t.equal(listen.calledWith(data.view, 'destroy'), true,
        'listens to "destroy" event');

    sand.restore();
    t.end();
});

test('confirm/Controller: onAnswer()', t => {
    const con  = new Controller();
    const data = {
        promise: {resolve: sand.stub()},
        view   : {destroy: sand.stub()},
    };

    con.onAnswer({answer: 'resolve'}, data);
    t.equal(data.promise.resolved, true,
        'changes the resolved status of the promise');
    t.equal(data.promise.resolve.calledWith('resolve'), true,
        'resolves the promise');
    t.equal(data.view.destroy.called, true,
        'destroyes the view');

    sand.restore();
    t.end();
});

test('confirm/Controller: onViewDestroy()', t => {
    const con  = new Controller();
    const data = {
        promise: {resolve: sand.stub(), resolved: true},
        view   : {el: 'test'},
    };
    sand.stub(con, 'stopListening');

    con.onViewDestroy(data);
    t.equal(data.promise.resolve.notCalled, true,
        'does not resolve the promise if it was already resolved');
    t.equal(con.stopListening.calledWith(data.view), true,
        'stops listening to view events');

    data.promise.resolved = false;
    con.onViewDestroy(data);
    t.equal(data.promise.resolve.calledWith('reject'), true,
        'resolves the promise with "reject" if it was not resolved');

    sand.restore();
    t.end();
});

test('confirm/Controller: after()', t => {
    Radio.channel('components/confirm').stopReplying();
    t.end();
});
