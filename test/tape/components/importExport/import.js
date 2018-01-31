/**
 * Test components/importExport/Import
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import '../../../../app/scripts/utils/underscore';

import Import from '../../../../app/scripts/components/importExport/Import';
import Profile from '../../../../app/scripts/models/Profile';

let sand;
test('importExport/Import: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('importExport/Import: channel', t => {
    t.equal(Import.prototype.channel.channelName, 'components/importExport');
    t.end();
});

test('importExport/Import: collections', t => {
    t.equal(new Import().collections.length, 6);
    t.deepEqual(
        new Import().collections,
        ['notebooks', 'tags', 'configs', 'users', 'files', 'profiles']
    );
    t.end();
});

test('importExport/Import: init()', t => {
    const con   = new Import();
    const iData = sand.stub(con, 'importData');
    const iKey  = sand.stub(con, 'importKey');

    t.equal(typeof con.init().then, 'function', 'returns a promise');
    t.equal(iData.notCalled, true, 'does not import any data if the array of files is empty');
    t.equal(iKey.notCalled, true, 'does not import the private key if the array of files is empty');

    con.options = {files: [{type: 'application/json', name: 'test.md'}]};
    con.init()
    .then(() => {
        t.equal(iData.notCalled, true, 'does not import any data if it is not a ZIP archive');
        t.equal(iKey.notCalled, true, 'does not import the private key if it is not a private key');

        con.options = {files: [{type: 'application/zip', name: 'b.zip'}]};
        return con.init();
    })
    .then(() => {
        t.equal(iData.called, true, 'imports data from the ZIP archive');

        con.options = {files: [{type: 'text/plain', name: 'k.asc', size: 2500}]};
        return con.init();
    })
    .then(() => {
        t.equal(iKey.called, true, 'imports the private key');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: onSuccess', t => {
    const con    = new Import();
    const reload = sand.stub(document.location, 'reload');
    const trig   = sand.stub(con.channel, 'trigger');

    con.onSuccess();
    t.equal(trig.calledWith('completed', {msg: 'Import success'}), true,
        'triggers "completed" event');

    con.isOldBackup = true;
    con.onSuccess();
    t.equal(trig.calledWith('completed', {msg: 'Old backup import success'}), true,
        'triggers "completed" event for old backup');

    setTimeout(() => {
        t.equal(reload.called, true, 'reloads the page');
        sand.restore();
        t.end();
    }, 900);
});

test('importExport/Import: onError', t => {
    const con    = new Import();
    const trig   = sand.stub(con.channel, 'trigger');

    con.onError('error');
    t.equal(trig.calledWith('completed', {error: 'error', msg: 'Import error'}),
        true, 'triggers "completed" event');

    sand.restore();
    t.end();
});

test('importExport/Import: isZipFile()', t => {
    const con = new Import();

    t.equal(con.isZipFile({type: 'application/zip'}), true,
        'returns true if file type is equal to application/zip');

    t.equal(con.isZipFile({name: 'backup.zip'}), true,
        'returns true if the file has ZIP extension');

    t.equal(con.isZipFile({name: 'backup.zip.png'}), false,
        'returns false');

    t.end();
});

test('importExport/Import: isKey()', t => {
    const con = new Import();
    con.options.files = [{
        type: 'text/plain',
        name: 'b.asc',
        size: 2000,
    }];

    t.equal(con.isKey({type: 'application/zip'}), false,
        'returns false if file type is not equal to text/plain');

    t.equal(con.isKey({type: 'text/plain', name: 'backup.zip'}), false,
        'returns false if the file does not have ASC extension');

    t.equal(con.isKey(), false, 'returns false if the size is less than 2500');

    con.options.files[0].size = 3500;
    t.equal(con.isKey(), true, 'returns true');

    t.end();
});

test('importExport/Import: importData()', t => {
    const file = {name: 'b.zip'};
    const con  = new Import({files: [file]});
    sand.stub(con, 'readZip').resolves('zip');
    sand.stub(con, 'import');
    sand.stub(con, 'onSuccess');

    con.importData()
    .then(() => {
        t.equal(con.readZip.calledWith(file), true, 'reads the ZIP archive');
        t.equal(con.import.calledWith('zip'), true, 'starts importing the data');
        t.equal(con.onSuccess.called, true, 'calls onSuccess()');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: importKey()', t => {
    const file = {name: 'key.asc'};
    const con  = new Import({files: [file]});
    const req  = sand.stub(Radio, 'request');
    sand.stub(con, 'readText').resolves('private key');
    sand.stub(con, 'onSuccess');

    con.importKey()
    .then(() => {
        t.equal(con.readText.calledWith(file), true, 'reads the private key');
        t.equal(req.calledWith('collections/Configs', 'saveConfig', {
            config: {value: 'private key', name: 'privateKey'},
        }), true, 'saves the key');
        t.equal(con.onSuccess.called, true, 'calls onSuccess()');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: readKey()', t => {
    const con  = new Import();
    const file = {name: 'k.asc'};

    const reader      = {readAsText: sand.stub()};
    global.FileReader = sand.stub().returns(reader);

    const res = con.readText(file);
    reader.onload({target: {result: '---private key---'}});

    res.then(res => {
        t.equal(reader.readAsText.calledWith(file), true, 'reads the file');
        t.equal(res, '---private key---', 'resolves with the key');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: readZip()', t => {
    const con = new Import();

    // Override FileReader
    const reader      = {readAsArrayBuffer: sand.stub()};
    global.FileReader = sand.stub().returns(reader);

    const res = con.readZip('file');
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(reader.readAsArrayBuffer.calledWith('file'), true, 'msg');
    t.equal(typeof con.zip, 'object', 'creates a JSZip instance');

    sand.stub(con.zip, 'loadAsync').returns(Promise.resolve('load'));
    reader.onload({target: {result: 'test'}});

    res.then(() => {
        t.equal(con.zip.loadAsync.calledWith('test'), true,
            'loads the archive\'s content');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: import()', t => {
    const con = new Import();
    const zip = {files: {
        'laverna-backups/notes-db/configs.json': {name: 'configs.json'},
    }};
    sand.stub(con, 'importProfile').resolves();
    sand.stub(con, 'importCollections').resolves();

    con.import(zip)
    .then(() => {
        t.equal(con.isOldBackup, true, 'sets isOldBackup property to true');
        t.equal(con.importCollections.calledWith(zip), true, 'imports the collection');
        t.equal(con.importProfile.notCalled, true, 'does not import the profile');

        zip.files = {'laverna-backups/alice/notes/1.json': {name: '1.json'}};
        return con.import(zip);
    })
    .then(() => {
        t.equal(con.importProfile.calledWith(zip), true, 'imports the profile');
        t.equal(con.importCollections.callCount, 2, 'imports the collections too');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: importProfile()', t => {
    const con   = new Import();
    const req   = sand.stub(Radio, 'request').returns(null);
    const async = sand.stub().resolves(JSON.stringify([{username: 'bob'}]));
    const zip   = {
        file  : sand.stub().returns({async}),
        files : {'laverna-backups/alice/profiles.json': {name: 'profiles.json'}},
    };
    const user  = new Profile({username: 'alice'});
    sand.stub(con, 'importCollection');

    con.importProfile({files: []})
    .catch(err => {
        t.equal(err, 'You need to create a profile first!');

        req.withArgs('collections/Profiles', 'getUser')
        .returns(user);

        return con.importProfile(zip);
    })
    .catch(err => {
        t.equal(err, 'You cannot import another users backup!');

        async.resolves(JSON.stringify([{username: 'alice'}]));
        return con.importProfile(zip);
    })
    .then(() => {
        t.equal(con.profile.username, 'alice');
        t.equal(con.importCollection.calledWith({
            data: [con.profile],
            type: 'profiles',
        }), true, 'imports the profile');
        t.equal(req.calledWith('collections/Profiles', 'setUser', con.profile),
            true, 'sets the profile');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: isCollectionFile()', t => {
    const con = new Import();

    t.equal(con.isCollectionFile({dir: true, name: 'name.json'}), false,
        'returns false if it is a directory');

    t.equal(con.isCollectionFile({name: '1.png'}), false,
        'returns false if it is not a JSON file');

    t.equal(con.isCollectionFile({name: 'profiles.json'}), false,
        'returns false if it is profiles.json');

    t.equal(con.isCollectionFile({name: 'notes/1.json'}), true);

    t.end();
});

test('importExport/Import: importCollections()', t => {
    const con = new Import();
    const zip = {files: [
        {name: 'profiles.json'},
        {name: 'configs.json'},
        {name: 'test.png'},
        {name: '/dir', dir: true},
        {name: 'notes/1.json'},
        {name: 'notebooks.json'},
    ]};
    sand.stub(con, 'readFile');

    con.importCollections(zip)
    .then(() => {
        t.equal(con.readFile.callCount, 3, 'ignores directories and non JSON files');
        t.equal(con.readFile.calledWith(zip, zip.files[1]), true, 'imports configs');
        t.equal(con.readFile.calledWith(zip, zip.files[4]), true, 'imports notes');
        t.equal(con.readFile.calledWith(zip, zip.files[5]), true, 'imports notebooks');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: readFile()', t => {
    const con   = new Import();
    const res   = JSON.stringify({id: '1'});
    const async = sand.stub().returns(Promise.resolve(res));
    con.zip     = {file: sand.stub().returns({async})};
    con.profile = {username: 'alice'};
    sand.stub(con, 'importNote');
    sand.stub(con, 'importFile');
    sand.stub(con, 'importCollection');

    const name = 'backup/notes-db/notes/1.json';
    con.readFile(con.zip, {name})
    .then(() => {
        t.equal(con.zip.file.calledWith(name), true,
            'reads the file');

        t.equal(con.importNote.calledWith({
            name,
            zip       : con.zip,
            profileId : 'notes-db',
            data      : {id: '1'},
        }), true, 'imports a note');

        return con.readFile(con.zip, {name: 'backup/default/files/1.json'});
    })
    .then(() => {
        t.equal(con.importFile.calledWithMatch({
            profileId: 'alice',
            data     : {id: '1'},
        }), true, 'imports files');

        return con.readFile(con.zip, {name: 'backup/default/notebooks.json'});
    })
    .then(() => {
        t.equal(con.importCollection.calledWith({
            profileId : 'alice',
            data      : {id: '1'},
            type      : 'notebooks',
        }), true, 'imports notebooks');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: importNote()', t => {
    const con   = new Import();
    const async = sand.stub().returns(Promise.resolve('test content'));
    const zip   = {file: sand.stub().returns({async})};
    const req   = sand.stub(Radio, 'request');
    sand.spy(con, 'readMarkdown');

    con.importNote({
        zip, data: {}, profileId: 'test', name: 'backups/test/notes/1.json.json',
    })
    .then(() => {
        t.equal(con.readMarkdown.called, true, 'tries to read Markdown content');

        t.equal(req.calledWith('collections/Notes', 'saveModelObject', {
            profileId    : 'test',
            data         : {content: 'test content'},
            dontValidate : true,
        }), true, 'saves the note to database');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: readMarkdown()', t => {
    const con    = new Import();
    const asyncZ = sand.stub().resolves('test content');
    const zip    = {file: sand.stub().returns({async: asyncZ})};
    let data     = {encryptedData: 'encryptedData'};

    con.importNote({zip, data, name: '1.json'})
    .then(() => {
        t.equal(asyncZ.notCalled, true, 'does nothing if data contains encrypted data');

        data = {encryptedData: ''};
        con.importNote({zip, data: {}, name: '1.json'})
    })
    .then(() => {
        t.equal(zip.file.calledWith('1.md'), true, 'reads the Markdown file');
        // t.equal(data.content, 'test content');

        sand.restore();
        t.end();
    });
});

test('importExport/Import: importFile()', t => {
    const con   = new Import();
    const req   = sand.stub(Radio, 'request');
    const options = {profileId: 'test', data: {id: '1'}};

    con.importFile(options);
    t.equal(req.calledWith('collections/Files', 'saveModelObject', {
        data      : options.data,
        profileId : options.profileId,
    }), true, 'saves the file to database');

    sand.restore();
    t.end();
});

test('importExport/Import: importCollection()', t => {
    const con = new Import();
    const req = sand.stub(Radio, 'request');

    con.importCollection({type: 'books'});
    t.equal(req.notCalled, true, 'does nothing if the collection name is incorrect');

    con.importCollection({type: 'notebooks', profileId: 'test', data: [1, 2]});
    t.equal(req.calledWithMatch('collections/Notebooks', 'saveFromArray', {
        profileId : 'test',
        values    : [1, 2],
    }), true, 'saves notebooks');

    sand.restore();
    t.end();
});
