/**
 * Test components/importExport/Export
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../app/scripts/utils/underscore';

import Export from '../../../../app/scripts/components/importExport/Export';
import Profile from '../../../../app/scripts/models/Profile';
import Notes from '../../../../app/scripts/collections/Notes';
import Files from '../../../../app/scripts/collections/Files';
import Tags from '../../../../app/scripts/collections/Tags';

const user = new Profile({username: 'alice', privateKey: 'private key'});
let sand;
test('importExport/Export: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('importExport/Export: user', t => {
    sand.stub(Radio, 'request')
    .withArgs('collections/Profiles', 'getUser')
    .returns(user);

    t.equal(new Export().user, user.attributes);
    sand.restore();
    t.end();
});

test('importExport/Export: collections', t => {
    const names = Export.prototype.collections;
    t.equal(Array.isArray(names), true, 'returns an array');
    t.equal(names.length, 6);
    t.end();
});

test('importExport/Export: init()', t => {
    const con = new Export();
    sand.stub(con, 'exportData').resolves();
    sand.stub(con, 'exportKey').resolves();
    sand.stub(con, 'export').resolves();

    const res = con.init();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(typeof con.zip, 'object', 'creates a JSZip instance');
    t.equal(con.export.called, true, 'calls "export" method');

    con.options = {data: []};
    con.init();
    t.equal(con.exportData.called, true, 'calls "exportData" method');

    con.options = {exportKey: true};
    con.init();
    t.equal(con.exportKey.called, true, 'calls "exportKey" method');

    sand.restore();
    t.end();
});

test('importExport/Export: exportData()', t => {
    const con = new Export({data: []});
    sand.stub(con, 'exportCollections').resolves();
    sand.stub(con, 'saveToFile').returns(Promise.resolve());

    const res = con.exportData();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(con.saveToFile.notCalled, true, 'does nothing if there is no data');

    con.options = {data: [new Notes()]};
    con.exportData()
    .then(() => {
        t.equal(con.exportCollections.called, true,
            'exports data from every collection');
        t.equal(con.saveToFile.called, true, 'saves the result to a ZIP file');

        sand.restore();
        t.end();
    });
});

test('importExport/Export: exportKey()', t => {
    const con   = new Export();
    global.Blob = sand.stub().callsFake(() => ['blob']);
    Object.defineProperty(con, 'user', {get: () => user.attributes});
    sand.stub(con, 'saveAs');
    sand.spy(con, 'destroy');

    con.exportKey();
    t.equal(con.saveAs.calledWith(['blob']), true);
    t.equal(con.saveAs.calledWith(['blob'], 'laverna-key-alice.asc'), true,
        'exports the private key');
    t.equal(con.destroy.called, true, 'destroyes itself');

    sand.restore();
    t.end();
});

test('importExport/Export: export()', t => {
    const con = new Export();
    sand.stub(con, 'fetchExportCollection').resolves();
    sand.stub(con, 'exportProfile');
    sand.stub(con, 'saveToFile');

    const res = con.export();
    t.equal(con.exportProfile.calledWith(), true,
        'exports the users profile');

    res.then(() => {
        t.equal(con.fetchExportCollection.callCount, con.collections.length,
            'exports all collections');
        t.equal(con.fetchExportCollection.calledWith('Notes'), true,
            'exports notes collection');
        t.equal(con.saveToFile.called, true,
            'saves the result to a ZIP file');

        sand.restore();
        t.end();
    });
});

test('importExport/Export: fetchExportCollection()', t => {
    const con   = new Export();
    const notes = new Notes();
    Object.defineProperty(con, 'profileId', {get: () => 'alice'});

    sand.stub(con, 'exportCollection');
    sand.stub(Radio, 'request')
    .withArgs('collections/Notes', 'find', {profileId: 'alice'})
    .resolves(notes);

    con.fetchExportCollection('Notes')
    .then(() => {
        t.equal(con.exportCollection.calledWith(notes), true,
            'exports the collection');

        sand.restore();
        t.end();
    });
});

test('importExport/Export: exportProfile()', t => {
    const con = new Export();
    con.zip   = {file: sand.stub()};
    Object.defineProperty(con, 'user', {get: () => user.attributes});
    const str = JSON.stringify([con.user]);

    con.exportProfile();
    t.equal(con.zip.file.calledWith('laverna-backups/profiles.json', str), true);

    sand.restore();
    t.end();
});

test('importExport/Export: exportCollections()', t => {
    const con = new Export();
    const col = new Notes();
    sand.stub(con, 'exportCollection');
    sand.stub(con, 'exportProfile');

    con.exportCollections([col]);
    t.equal(con.exportCollection.calledWith(col), true,
        'exports data from each collection');
    t.equal(con.exportProfile.called, true, 'export the users profile');

    sand.restore();
    t.end();
});

test('importExport/Export: exportCollection()', t => {
    const con = new Export();
    Object.defineProperty(con, 'profileId', {get: () => 'bob'});
    sand.stub(con, 'exportNote');

    const col = new Notes(null, {profileId: 'testdb'});
    const mod = new Notes.prototype.model({id: '1'});
    col.fullCollection = col.clone();
    col.fullCollection.add(mod);
    con.exportCollection(col);
    t.equal(con.exportNote.calledWith('laverna-backups/testdb', mod), true,
        'exports every model from notes collection');

    sand.stub(con, 'exportFile');
    const files = new Files(null, {profileId: 'testdb'});
    const file  = new Files.prototype.model({id: '1'});
    files.add(file);
    con.exportCollection(files);
    t.equal(con.exportFile.calledWith('laverna-backups/testdb', file), true,
        'exports every model from files collection');

    const tags = new Tags();
    con.zip    = {file: sand.stub()};
    con.exportCollection(tags);
    t.equal(con.zip.file.calledWith('laverna-backups/bob/tags.json'),
        true, 'exports data to a JSON file');

    sand.restore();
    t.end();
});

test('importExport/Export: exportToJSON()', t => {
    const con        = new Export();
    con.zip          = {file: sand.stub()};
    const collection = new Notes();
    const stub       = sand.stub();
    sand.stub(collection, 'toJSON');

    con.exportToJSON('/', collection);
    t.equal(collection.toJSON.called, true, 'uses toJSON()');

    collection.getExportData = stub;
    con.exportToJSON('/', collection);
    t.equal(stub.called, true, 'uses getExportData() if the collection has it');

    sand.restore();
    t.end();
});

test('importExport/Export: exportNote()', t => {
    const con = new Export();
    const mod = new Notes.prototype.model({id: '1', content: 'test'});
    con.zip   = {file: sand.stub()};

    con.exportNote('backups', mod);
    t.equal(con.zip.file.calledWith('backups/notes/1.md', mod.get('content')),
        true, 'saves the content in a Markdown file');
    t.equal(con.zip.file.calledWith('backups/notes/1.json'),
        true, 'saves other attributes in a JSON file');

    mod.set({encryptedData: '--encryptedData--', id: '2'});
    con.exportNote('backups', mod);
    t.equal(con.zip.file.calledWith('backups/notes/2.md', mod.get('content')),
        false, 'does not save plain text Markdown if a model has encryptedData attribute');
    t.equal(con.zip.file.calledWith('backups/notes/2.json'),
        true, 'saves other attributes in a JSON file');

    sand.restore();
    t.end();
});

test('importExport/Export: exportFile()', t => {
    const con = new Export();
    const mod = new Files.prototype.model({id: '1', src: 'test'});
    con.zip   = {file: sand.stub()};

    con.exportFile('backups', mod);
    t.equal(con.zip.file.calledWith('backups/files/1.json'),
        true, 'saves all model attributes in a JSON file');

    sand.restore();
    t.end();
});

test('importExport/Export: saveToFile()', t => {
    const con = new Export();
    con.zip   = {generateAsync: sand.stub().returns(Promise.resolve('test'))};
    Object.defineProperty(con, 'user', {get: () => user.attributes});
    sand.stub(con, 'destroy');
    sand.stub(con, 'saveAs');

    con.saveToFile()
    .then(() => {
        t.equal(con.zip.generateAsync.calledWith({type: 'blob'}), true,
            'generates ZIP blob');
        t.equal(con.saveAs.calledWith('test', 'laverna-backup-alice.zip'), true,
            'saves the blob in laverna-backup.zip archive');

        sand.restore();
        t.end();
    });
});
