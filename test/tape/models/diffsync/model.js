/**
 * Test models/diffsync/Model
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import jsondiffpatch from 'jsondiffpatch';
import fastpatch from 'fast-json-patch';

import _ from '../../../../app/scripts/utils/underscore';
import Model from '../../../../app/scripts/models/diffsync/Model';
import Shadow from '../../../../app/scripts/models/Shadow';
import Note from '../../../../app/scripts/models/Note';

import Edits from '../../../../app/scripts/collections/Edits';
import Notes from '../../../../app/scripts/collections/Notes';
import Notebooks from '../../../../app/scripts/collections/Notebooks';
import Files from '../../../../app/scripts/collections/Files';

let sand;
test('models/diffsync/Model: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('models/diffsync/Model: channel', t => {
    t.equal(Model.prototype.channel.channelName, 'models/Diffsync');
    t.end();
});

test('models/diffsync/Model: peerChannel', t => {
    t.equal(Model.prototype.peerChannel.channelName, 'models/Peer');
    t.end();
});

test('models/diffsync/Model: formChannel', t => {
    t.equal(Model.prototype.formChannel.channelName, 'components/notes/form');
    t.end();
});

test('models/diffsync/Model: ignoreKeys', t => {
    const ignore = Model.prototype.ignoreKeys;
    t.equal(Array.isArray(ignore), true, 'returns an array');
    t.deepEqual(ignore, ['encryptedData', 'updated'], 'msg');
    t.end();
});

test('models/diffsync/Model: constructor()', t => {
    const options = {profileId: 'test', shadows: 'shadows', edits: 'edits'};
    const model   = new Model(options);

    t.equal(model.options, options, 'creates "options" property');
    t.equal(model.shadows, options.shadows, 'creates "shadows" property');
    t.equal(model.edits, options.edits, 'creates "edits" property');
    t.equal(typeof model.fastpatch, 'object', 'creates "fastpatch" property');
    t.equal(typeof model.jsondiffpatch, 'object', 'creates "jsondiffpatch" property');

    t.end();
});

test('models/diffsync/Model: fastpatch', t => {
    const model = new Model({});

    t.equal(model.fastpatch.diff, fastpatch.compare, 'has "diff" method');

    const obj     = {title: 'Hello'};
    const diff    = model.fastpatch.diff(obj, {title: 'Hello world'});
    const patched = model.fastpatch.patch(obj, diff);
    t.equal(typeof patched, 'object', 'returns an object');
    t.equal(patched.title, 'Hello world', 'returns a patched object');

    t.end();
});

test('models/diffsync/Model: getDiff()', t => {
    const model = new Model({});

    t.equal(model.getDiff('files'), model.fastpatch,
        'returns fastpatch if docType is equal to "files"');

    t.equal(model.getDiff('notes'), model.jsondiffpatch,
        'returns jsondiffpatch if docType is not equal to "files"');

    t.end();
});

test('models/diffsync/Model: findDocs()', t => {
    const model = new Model({profileId: 'test'});
    const req   = sand.stub(Radio, 'request');

    t.equal(typeof model.findDocs().then, 'function', 'returns a promise');

    const types = ['Notes', 'Notebooks', 'Tags', 'Files', 'Users'];
    types.forEach(type => {
        t.equal(req.calledWith(`collections/${type}`, 'find', {
            profileId: 'test',
            perPage  : 0,
        }), true, `fetches ${type}`);
    });

    sand.restore();
    t.end();
});

test('models/diffsync/Model: findSharedDocs()', t => {
    const model = new Model({});
    const notes = new Notes([
        {id: '1', sharedWith: ['bob']},
        {id: '2', sharedBy: 'bob'},
        {id: '3', sharedBy: 'someone'},
    ]);
    const files = new Files();
    sand.stub(model, 'findFileAttachments').returns(files);

    const res = model.findSharedDocs('bob', [notes]);
    t.equal(res[0].length, 2, 'contains an array of shared notes');
    t.equal(res[1], files, 'contains an array of shared files');

    sand.restore();
    t.end();
});

test('models/diffsync/Model: findFileAttachments()', t => {
    const model = new Model({});
    const notes = new Notes([
        {id: '1', files: ['1']},
        {id: '2', files: ['2', '3']},
    ]);
    const files = new Files([{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}]);

    const res = model.findFileAttachments([notes, files], notes.models);
    t.equal(res.length, 3,
        'returns all file models which are attached to shared notes');

    t.end();
});

test('models/diffsync/Model: getDocAttr()', t => {
    const model = new Model({configs: {username: 'bob'}});
    const note  = new Notes.prototype.model({id: '1', notebookId: '2'});
    const req   = sand.stub(Radio, 'request')
        .withArgs('components/editor', 'getContent')
        .returns('editor content');

    function checkKeys(keys, ignore) {
        ignore.forEach(key => {
            t.equal(keys.indexOf(key) === -1, true, `does not contain ${key}`);
        });
    }

    const res = model.getDocAttr(note, 'bob');
    t.equal(typeof res, 'object', 'returns an object');
    checkKeys(_.keys(res), model.ignoreKeys);

    model.liveDoc = new Notes.prototype.model({id: '2'});
    const res2    = model.getDocAttr(note, 'alice');
    checkKeys(_.keys(res2), ['sharedBy', 'sharedWith'].concat(model.ignoreKeys));
    t.equal(req.notCalled, true, 'uses the notes content attribute');

    model.liveDoc = note;
    const res3    = model.getDocAttr(note, 'bob');
    t.equal(res3.content, 'editor content');
    t.equal(req.called, true,
        'requests the content attribute from the editor if it is a "live" session');

    sand.restore();
    t.end();
});

test('models/diffsync/Model: findCollection()', t => {
    const model  = new Model({});
    const notes  = new Notes();
    const shadow = new Shadow({docType: 'notes'});

    t.equal(model.findCollection([notes, new Files()], shadow), notes,
        'can find a shadow\'s collection by docType');

    t.end();
});

test('models/diffsync/Model: findDoc()', t => {
    const model  = new Model({});
    const notes  = new Notes([{id: '1'}]);
    const shadow = new Shadow({docType: 'notes', docId: '1'});

    t.equal(model.findDoc([new Files, notes], shadow), notes.at(0),
        'can find the document');

    t.end();
});

test('models/diffsync/Model: findPeerEdits()', t => {
    const model = new Model({});
    model.edits = new Edits([
        {username: 'alice', deviceId: '1', encryptedData: 'hello', doc: {}},
        {username: 'alice', deviceId: '2'},
        {username: 'bob', deviceId: '1'},
        {username: 'alice', deviceId: '1', encryptedData: 'hello', doc: {}},
    ]);

    const res = model.findPeerEdits({username: 'alice', deviceId: '1'});
    t.equal(Array.isArray(res), true, 'returns an array');
    t.equal(res.length, 2, 'returns only edits which should be sent to a peer');

    t.equal(res[0].doc, undefined, 'omit un-encrypted data');
    t.equal(res[0].encryptedData, 'hello', 'send only encrypted data');

    t.end();
});

test('models/diffsync/Model: findDocPeers()', t => {
    const model = new Model({configs: {username: 'bob'}});
    const doc   = new Note({sharedWith: ['alice'], sharedBy: 'me'});
    sand.stub(model.channel, 'request').returns([
        {username: 'bob'},
        {username: 'alice'},
        {username: 'someone'},
        {username: 'me'},
    ]);

    const res = model.findDocPeers(doc);
    t.equal(res.length, 3,
        'returns an array of peers whom the document is shared with');

    sand.restore();
    t.end();
});
