/**
 * Test models/diffsync/Core
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from 'underscore';

import Core from '../../../../app/scripts/models/diffsync/Core';
import Diff from '../../../../app/scripts/models/diffsync/Diff';
import Patch from '../../../../app/scripts/models/diffsync/Patch';

let sand;
test('models/diffsync/Core: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('models/diffsync/Core: channel', t => {
    t.equal(Core.prototype.channel.channelName, 'models/Diffsync');
    t.end();
});

test('models/diffsync/Core: peerChannel', t => {
    t.equal(Core.prototype.peerChannel.channelName, 'models/Peer');
    t.end();
});

test('models/diffsync/Core: configs', t => {
    const conf = {test: true};
    const req  = sand.stub(Radio, 'request').returns(conf);

    t.equal(Core.prototype.configs, conf, 'returns the result of the request');
    t.equal(req.calledWith('collections/Configs', 'findConfigs'), true,
        'makes a "findConfigs" request');

    sand.restore();
    t.end();
});

test('models/diffsync/Core: profileId', t => {
    const req = sand.stub(Radio, 'request').returns('test');

    t.equal(Core.prototype.profileId, 'test', 'returns the result of the request');
    t.equal(req.calledWith('collections/Profiles', 'getProfile'), true,
        'makes a "getProfile" request');

    sand.restore();
    t.end();
});

test('models/diffsync/Core: constructor()', t => {
    const reply = sand.stub(Core.prototype.channel, 'reply');
    const on    = sand.stub(Core.prototype.peerChannel, 'on');
    const core  = new Core();

    t.equal(typeof core.options, 'object', 'creates "options" property');
    t.equal(typeof core.pending, 'object', 'creates "pending" property');
    t.equal(typeof core.locked, 'object', 'creates "locked" property');

    t.equal(reply.calledWith({
        isLocked       : core.isLocked,
        lockDoc        : core.lockDoc,
        unlockDoc      : core.unlockDoc,
        isPending      : core.isPending,
        waitPeer       : core.waitPeer,
        stopPeerWait   : core.stopPeerWait,
        getClientPeers : core.getClientPeers,
    }, core), true, 'starts replying to requests');

    t.equal(on.calledWith('close:peer'), true, 'listens to "close:peer" event');

    sand.restore();
    t.end();
});

test('models/diffsync/Core: init()', t => {
    const core     = new Core();
    const schedule = sand.stub(Diff.prototype, 'schedule');
    sand.stub(core, 'findShadows').returns(Promise.resolve());

    core.init()
    .then(() => {
        t.equal(core.diff instanceof Diff, true, 'instantiates Diff class');
        t.equal(core.patch instanceof Patch, true, 'instantiates Patch class');
        t.equal(schedule.called, true, 'schedules diff checks');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Core: findShadows()', t => {
    const req  = sand.stub(Radio, 'request');
    const core = new Core();
    req.withArgs('collections/Shadows').returns(Promise.resolve('shadows'));
    req.withArgs('collections/Edits').returns(Promise.resolve('edits'));

    core.findShadows()
    .then(() => {
        t.equal(req.calledWith('collections/Shadows', 'find'), true,
            'fetches shadows');
        t.equal(req.calledWith('collections/Edits', 'find'), true,
            'fetches edits');

        t.equal(core.options.shadows, 'shadows', 'creates "shadows" property');
        t.equal(core.options.edits, 'edits', 'creates "edits" property');

        sand.restore();
        t.end();
    });
});

test('models/diffsync/Core: getClientPeers()', t => {
    const core   = new Core();
    const cPeers = [
        {username: 'alice', deviceId: '1', initiator: true},
        {username: 'alice', deviceId: '2', initiator: false},
    ];
    sand.stub(Radio, 'request').returns(cPeers);

    Object.defineProperty(core, 'configs', {
        get : () => {
            return {
                peers: [
                    {username: 'alice', deviceId: '1'},
                    {username: 'alice', deviceId: '2'},
                    {username: 'alice', deviceId: '3'},
                ],
            };
        },
    });

    const peers = core.getClientPeers();
    t.equal(Array.isArray(peers), true, 'returns an array');
    t.equal(peers.length, 2, 'the array is not empty');

    t.notEqual(_.findWhere(peers, {username: 'alice', deviceId: '1'}), undefined,
        'includes peers who initiated the connection');
    t.equal(_.findWhere(peers, {username: 'alice', deviceId: '2'}), undefined,
        'does not include peers who did not initiate the connection');
    t.notEqual(_.findWhere(peers, {username: 'alice', deviceId: '3'}), undefined,
        'includes peers who are offline');

    sand.restore();
    t.end();
});

test('models/diffsync/Core: isLocked()', t => {
    const core = new Core();

    t.equal(core.isLocked('notes', '1'), false,
        'returns false if the document is not locked');

    core.locked['notes/1'] = true;
    t.equal(core.isLocked('notes', '1'), true,
        'returns true if the document is locked');

    t.end();
});

test('models/diffsync/Core: lockDoc()', t => {
    const core = new Core();

    core.lockDoc('notes', '1');
    t.equal(core.locked['notes/1'], true, 'locks the document');
    t.equal(core.isLocked('notes', '1'), true, 'isLocked() returns true');

    t.end();
});

test('models/diffsync/Core: unlockDoc()', t => {
    const core = new Core();

    core.locked['notes/1'] = true;
    core.unlockDoc('notes', '1');

    t.equal(core.locked['notes/1'], false, 'unlocks the document');
    t.equal(core.isLocked('notes', '1'), false, 'isLocked() returns true');

    t.end();
});

test('models/diffsync/Core: isPending()', t => {
    const core = new Core();

    t.equal(core.isPending({username: 'bob', deviceId: '1'}), false,
        'returns true if it is not waiting for a peer to respond');

    core.pending['bob@1'] = 1;
    t.equal(core.isPending({username: 'bob', deviceId: '1'}), true,
        'returns false if it is waiting for a peer to respond');

    t.end();
});

test('models/diffsync/Core: waitPeer()', t => {
    const core = new Core();
    const set  = sand.stub(window, 'setTimeout').returns(1);
    const peer = {username: 'bob', deviceId: '1'};

    core.waitPeer(peer);
    t.equal(set.called, true, 'schedules a timeout');
    t.equal(core.pending['bob@1'], 1, 'saves the timeout ID');
    t.equal(core.isPending(peer), true, 'isPending() returns true');

    sand.restore();
    t.end();
});

test('models/diffsync/Core: stopPeerWait()', t => {
    const core  = new Core();
    const clear = sand.stub(window, 'clearTimeout');
    const peer  = {username: 'bob', deviceId: '1'};

    core.stopPeerWait(peer);
    t.equal(clear.notCalled, true, 'does nothing if there is no timeout');

    core.pending['bob@1'] = 1;
    core.stopPeerWait(peer);

    t.equal(clear.calledWith(1), true, 'clears the timeout');
    t.equal(core.pending['bob@1'], 0, 'changes pending status');
    t.equal(core.isPending(peer), false, 'isPending() returns false');

    sand.restore();
    t.end();
});

test('models/diffsync/Core: onClosePeer()', t => {
    const core = new Core();
    const stop = sand.stub(core, 'stopPeerWait');

    const peer = {username: 'alice', deviceId: '1'};
    core.onClosePeer({peer});
    t.equal(stop.calledWith(peer), true, 'stops waiting for a peers response');

    sand.restore();
    t.end();
});
