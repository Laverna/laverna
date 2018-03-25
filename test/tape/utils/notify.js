/**
 * Test utils/Notify
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Notify from '../../../app/scripts/utils/Notify';

let sand;
test('utils/Notify: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('utils/Notify: channel', t => {
    t.equal(Notify.prototype.channel.channelName, 'utils/Notify');
    t.end();
});

test('utils/Notify: constructor()', t => {
    const rep = sand.stub(Notify.prototype.channel, 'reply');
    sand.stub(Notify.prototype, 'isSupported').returns(true);

    const n = new Notify();
    t.equal(rep.calledWith({
        show: n.show,
    }, n), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('utils/Notify: isSupported()', t => {
    const n = new Notify();
    t.equal(n.isSupported(), false, 'returns false');

    window.Notification = () => {};
    t.equal(n.isSupported(), true, 'returns true');
    t.end();
});

test('utils/Notify: init()', t => {
    const n           = new Notify();
    const isSupported = sand.stub(n, 'isSupported').returns(false);

    t.equal(typeof n.init().then, 'function', 'returns a promise');

    isSupported.returns(true);
    global.Notification = {requestPermission: fnc => fnc('granted')};

    n.init()
    .then(() => {
        global.Notification.requestPermission = fnc => fnc('');
        return n.init();
    })
    .catch(() => {
        sand.restore();
        t.end();
    });
});

test('utils/Notify: show()', t => {
    const n = new Notify();
    global.Notification = sand.stub();

    n.show({title: 'Hello', body: 'The body'});
    t.equal(global.Notification.calledWith('Hello', {
        body: 'The body',
    }), true, 'shows the notification');

    sand.restore();
    t.end();
});
