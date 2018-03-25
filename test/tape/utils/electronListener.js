/**
 * Test utils/electronListener
 * @file
 */
import test from 'tape';
import sinon from 'sinon';

import listener from '../../../app/scripts/utils/electronListener';

let sand;
test('utils/electronListener: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('utils/electronlistener: does nothing if it is not Electron environment', t => {
    t.equal(listener(), false);
    t.end();
});

test('utils/electronlistener: starts listening to ipcRenderer events', t => {
    const on = sand.stub();
    window.electron = {ipcRenderer: {on}};

    t.equal(listener(), true, 'returns true');

    t.equal(on.calledWith('lav:settings'), true, 'listens to lav:settings');
    t.equal(on.calledWith('lav:newNote'), true, 'listens to lav:newNote');
    t.equal(on.calledWith('lav:about'), true, 'listens to lav:about');

    t.equal(on.calledWith('lav:import:evernote'), true, 'listens to lav:import:evernote');
    t.equal(on.calledWith('lav:backup:key'), true, 'listens to lav:backup:key');
    t.equal(on.calledWith('lav:backup:data'), true, 'listens to lav:backup:data');

    window.electron = null;
    sand.restore();
    t.end();
});
