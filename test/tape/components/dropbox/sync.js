/**
 * @file Test components/dropbox/Sync
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import '../../../../app/scripts/utils/underscore';
import Notes from '../../../../app/scripts/collections/Notes';
import Sync from '../../../../app/scripts/components/dropbox/Sync';
import Adapter from '../../../../app/scripts/components/dropbox/Adapter';

let sand;
test('components/dropbox/Sync: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('components/dropbox/Sync: channel', t => {
    t.equal(Sync.prototype.channel.channelName, 'components/sync');
    t.end();
});

test('components/dropbox/Sync: configs', t => {
    const configs = {dropboxKey: ''};
    sand.stub(Radio, 'request').returns(configs);
    t.equal(Sync.prototype.configs, configs, 'returns configs');
    sand.restore();
    t.end();
});

test('components/dropbox/Sync: collectionNames', t => {
    t.deepEqual(Sync.prototype.collectionNames, [
        'Notes', 'Notebooks', 'Tags', 'Files',
    ], 'returns collection names');
    t.end();
});

test('components/dropbox/Sync: profileId', t => {
    sand.stub(Radio, 'request')
    .withArgs('collections/Profiles', 'getProfile')
    .returns('test');

    t.equal(Sync.prototype.profileId, 'test');

    sand.restore();
    t.end();
});

test('components/dropbox/Sync: override .configs', t => {
    sinon.stub(Sync.prototype, 'configs')
    .get(() => {
        return {dropboxKey: ''};
    });

    t.end();
});

test('components/dropbox/Sync: constructor()', t => {
    const reply = sand.stub(Sync.prototype.channel, 'reply');
    const sync  = new Sync();

    t.equal(sync.adapter instanceof Adapter, true,
        'creates an instance of Dropbox adapter');

    t.deepEqual(sync.stat, {
        interval    : 2000,
        intervalMax : 15000,
        intervalMin : 2000,
    }, 'creates .stat property');

    t.equal(reply.calledWith({
        start: sync.start,
    }, sync), true, 'starts replying to requests');

    sand.restore();
    t.end();
});

test('components/dropbox/Sync: init()', t => {
    const sync  = new Sync();
    const check = sand.stub(sync.adapter, 'checkAuth').resolves(false);
    sand.stub(sync, 'start');

    sync.init()
    .then(() => {
        t.equal(check.called, true, 'checks authentication');
        t.equal(sync.start.notCalled, true, 'does nothing if authentication failed');

        check.resolves(true);
        return sync.init();
    })
    .then(() => {
        t.equal(sync.start.called, true, 'starts synchronization');
        sand.restore();
        t.end();
    });
});

test('components/dropbox/Sync: start()', t => {
    const sync = new Sync();
    sand.spy(sync, 'stopWatch');
    sand.stub(sync, 'sync');

    sync.start();

    setTimeout(() => {
        t.equal(sync.stopWatch.called, true, 'stops the previous watch first');
        t.equal(sync.sync.called, true, 'checks for changes');

        sand.restore();
        t.end();
    }, 600);
});

test('components/dropbox/Sync: startWatch()', t => {
    const sync = new Sync();
    sand.stub(sync, 'getInterval').returns(100);
    sand.spy(sync, 'stopWatch');
    sand.stub(sync, 'sync');

    sync.startWatch();

    setTimeout(() => {
        t.equal(sync.stopWatch.called, true, 'stops the previous watch first');
        t.equal(sync.sync.called, true, 'checks for changes');

        sand.restore();
        t.end();
    }, 200);
});

test('components/dropbox/Sync: getInterval() - increases the value until it reaches the max', t => {
    const sync = new Sync();

    let prev;

    do {
        prev = sync.getInterval();
    }
    while (prev < sync.stat.intervalMax) {
        t.end();
    };
});

test('components/dropbox/Sync: getInterval() - decreases the value until it reaches the min', t => {
    const sync = new Sync();

    let prev;
    sync.stat.interval   = sync.stat.intervalMax;
    sync.stat.statRemote = true;

    do {
        prev = sync.getInterval();
    }
    while (prev > sync.stat.intervalMin) {
        t.end();
    };
});

test('components/dropbox/Sync: stopWatch', t => {
    const sync = new Sync();
    sand.stub(window, 'clearTimeout');

    sync.timeout = 1;
    sync.stopWatch();
    t.equal(window.clearTimeout.calledWith(sync.timeout), true,
        'clears the timeout');

    sand.restore();
    t.end();
});

test('components/dropbox/Sync: sync()', t => {
    const sync           = new Sync();
    sync.stat.statRemote = true;

    const trig = sand.stub(sync.channel, 'trigger');
    sand.stub(sync, 'syncCollection').resolves();
    sand.stub(sync, 'startWatch');

    const res = sync.sync();
    t.equal(trig.calledWith('start'), true, 'triggers "start" event');
    t.equal(sync.stat.statRemote, false, 'changes .statRemote to "false"');

    res.then(() => {
        t.equal(sync.syncCollection.callCount, sync.collectionNames.length,
            'checks all collections');
        t.equal(trig.calledWith('stop', {result: 'success'}), true,
            'triggers "stop" event');
        t.equal(sync.startWatch.called, true, 'schedules a new check');

        sand.restore();
        t.end();
    });
});

test('components/dropbox/Sync: syncCollection()', t => {
    const sync       = new Sync();
    const collection = new Notes();
    const files      = ['files'];
    Object.defineProperty(sync, 'profileId', {get: () => 'test'});

    sand.stub(Radio, 'request').withArgs('collections/Notes', 'find')
    .resolves(collection);
    sand.stub(sync.adapter, 'find').resolves(files);
    sand.stub(sync, 'syncRemoteChanges').resolves();
    sand.stub(sync, 'syncLocalChanges').resolves();

    sync.syncCollection('Notes')
    .then(() => {
        t.equal(sync.adapter.find.calledWith({type: 'notes', profileId: 'test'}),
            true, 'fetches files from Dropbox');

        const data = {files, collection};
        t.equal(sync.syncRemoteChanges.calledWith(data), true,
            'saves remote changes to local database');

        t.equal(sync.syncLocalChanges.calledWith(data), true,
            'saves local changes to Dropbox');

        sand.restore();
        t.end();
    });
});

test('components/dropbox/Sync: syncRemoteChanges()', t => {
    const sync       = new Sync();
    const files      = [{id: '1'}, {id: '2'}, {id: '3', updated: 2}, {id: '4', updated: 1}];
    const collection = new Notes([{id: '1'}, {id: '3', updated: 1}, {id: '4', updated: 2}]);
    const req        = sand.stub(collection.channel, 'request');
    Object.defineProperty(sync, 'profileId', {get: () => 'test'});

    sync.syncRemoteChanges({files, collection})
    .then(() => {
        t.equal(sync.stat.statRemote, true, 'changes .statRemote to "true"');
        t.equal(req.callCount, 2, 'creates 2 new models');

        t.equal(req.calledWith('saveModelObject', {
            data      : {id: '2'},
            profileId : 'test',
        }), true, 'saves the file which does not exist locally');

        t.equal(req.calledWith('saveModelObject', {
            data      : {id: '3', updated: 2},
            profileId : 'test',
        }), true, 'saves the file which has been changed on Dropbox');

        sand.restore();
        t.end();
    });
});

test('components/dropbox/Sync: syncLocalChanges()', t => {
    const sync       = new Sync();
    const files      = [{id: '2'}, {id: '3', updated: 1}, {id: '4', updated: 2}];
    const collection = new Notes([{id: '1'}, {id: '3', updated: 2}, {id: '4', updated: 1}]);
    const save       = sand.stub(sync.adapter, 'saveModel');
    Object.defineProperty(sync, 'profileId', {get: () => 'test'});

    sync.syncLocalChanges({files, collection})
    .then(() => {
        t.equal(save.callCount, 2, 'saves only 2 files');

        t.equal(save.calledWith({
            model     : collection.get('1'),
            profileId : 'test',
        }), true, 'saves the model which does not exist on Dropbox');

        t.equal(save.calledWith({
            model     : collection.get('3'),
            profileId : 'test',
        }), true, 'saves the model which has been changed locally');

        sand.restore();
        t.end();
    });
});
