/**
 * @file Test components/dropbox/Adapter
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';

import Backbone from 'backbone';
import Dropbox from 'dropbox';
import _ from '../../../../app/scripts/utils/underscore';
import Adapter from '../../../../app/scripts/components/dropbox/Adapter';
import Notes from '../../../../app/scripts/collections/Notes';

const configs = {dropboxKey: '', dropboxAccessToken: ''};
let sand;
test('components/dropbox/Adapter: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('components/dropbox/Adapter: clientKey', t => {
    t.equal(typeof Adapter.prototype.clientKey, 'string');
    t.end();
});

test('components/dropbox/Adapter: constructor()', t => {
    const adapter = new Adapter(configs);

    t.equal(typeof adapter.configs, 'object', 'creates .configs property');
    t.equal(adapter.dbx instanceof Dropbox, true, 'creates an instance of Dropbox SDK');

    t.end();
});

test('components/dropbox/Adapter: checkAuth()', t => {
    const adapter = new Adapter(configs);
    const set     = sand.stub(adapter.dbx, 'setAccessToken');
    sand.stub(adapter, 'saveAccessToken').resolves();
    sand.stub(adapter, 'parseHash').returns({});
    sand.stub(adapter, 'authenticate').resolves();

    adapter.checkAuth()
    .then(() => {
        t.equal(adapter.authenticate.called, true,
            'starts authentication process');

        adapter.parseHash.returns({access_token: '1'});
        return adapter.checkAuth();
    })
    .then(() => {
        t.equal(adapter.saveAccessToken.calledWith('1'), true,
            'saves the access token');

        adapter.configs.accessToken = '2';
        return adapter.checkAuth();
    })
    .then(() => {
        t.equal(set.calledWith('2'), true, 'sets the access token');

        sand.restore();
        t.end();
    });
});

test('components/dropbox/Adapter: parseHash()', t => {
    const adapter             = new Adapter(configs);
    Backbone.history.fragment = 'access_token=1&error=no';

    const res = adapter.parseHash();
    t.equal(typeof res, 'object', 'returns an object');
    t.equal(res.access_token, '1', 'the result contains access_token');

    t.equal(adapter.parseHash('access_token=2&error=no').access_token, '2',
        'can parse a specified url');

    Backbone.history.fragment = '';
    t.equal(adapter.parseHash().access_token, undefined, 'does not contain access_token');

    Backbone.history.fragment = 'notes/f/notebook/q/';
    t.equal(adapter.parseHash().access_token, undefined, 'does not contain access_token');

    sand.restore();
    t.end();
});

test('components/dropbox/Adapter: authenticate()', t => {
    const adapter = new Adapter(configs);
    const wind    = window;
    window        = {cordova: null}
    sand.stub(adapter, 'authCordova');
    sand.stub(adapter, 'authBrowser');

    adapter.authenticate();
    t.equal(adapter.authBrowser.called, true, 'calls .authBrowser()');

    window.cordova = {};
    adapter.authenticate();
    t.equal(adapter.authCordova.called, true, 'calls .authCordova()');

    window = wind;
    sand.restore();
    t.end();
});

test('components/dropbox/Adapter: authBrowser()', t => {
    const adapter = new Adapter(configs);
    const authUrl = 'http://localhost:8000/';
    const wind    = window;
    window        = {location: ''};

    sand.stub(adapter.dbx, 'getAuthenticationUrl').returns(authUrl);
    sand.stub(_, 'i18n').callsFake(str => str);
    sand.stub(adapter, 'authElectron');
    const confirm = sand.stub(Radio, 'request').withArgs('components/confirm', 'show', {
        content: 'dropbox.auth confirm',
    });

    confirm.resolves('reject');
    adapter.authBrowser()
    .then(() => {
        t.notEqual(window.location, authUrl, 'does not change window location');

        confirm.resolves('confirm');
        return adapter.authBrowser();
    })
    .then(() => {
        t.equal(adapter.authElectron.notCalled, true, 'does not call authElectron()');

        window.electron = {};
        return adapter.authBrowser();
    })
    .then(() => {
        t.equal(adapter.authElectron.called, true, 'waits for a response from Electron');

        window = wind;
        sand.restore();
        t.end();
    });
});

test('components/dropbox/Adapter: authElectron()', t => {
    const adapter   = new Adapter(configs);
    let callback;
    const once      = sand.stub().callsFake((evt, fnc) => callback = fnc);
    window.electron = {ipcRenderer: {once}};
    sand.stub(adapter, 'saveAccessToken').resolves(true);

    const res = adapter.authElectron();
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(once.calledWith('lav:dropbox:oauth'), true,
            'starts listening to lav:dropbox:oauth event');

    setTimeout(() => {
        callback('lav', {url: 'http://localhost/#access_token=1'});
    }, 20);

    adapter.authElectron()
    .then(auth => {
        t.equal(adapter.saveAccessToken.calledWith('1'), true, 'saves the access token');
        t.equal(auth, true, 'resolves with "true"');

        const res = adapter.authElectron();
        setTimeout(() => callback('lav', {}), 20);
        return res;
    })
    .then(auth => {
        t.equal(auth, false, 'resolves with false');

        window.electron = undefined;
        sand.restore();
        t.end();
    });
});

test('components/dropbox/Adapter: authCordova()', t => {
    const adapter = new Adapter(configs);
    const stub    = sand.stub(adapter.dbx, 'authenticateWithCordova');
    const save    = sand.stub(adapter, 'saveAccessToken').resolves(true);

    stub.callsFake(successFnc => successFnc('1'));

    adapter.authCordova()
    .then(res => {
        t.equal(save.calledWith('1'), true, 'changes configs');
        t.equal(res, true, 'resolves with "true"');

        stub.callsFake((successFnc, errorFnc) => errorFnc());
        return adapter.authCordova();
    })
    .then(res => {
        t.equal(res, false, 'resolves with "false"');
        sand.restore();
        t.end();
    });
});

test('components/dropbox/Adapter: saveAccessToken()', t => {
    const adapter = new Adapter(configs);
    const req     = sand.stub(Radio, 'request');

    req.withArgs('collections/Configs', 'saveConfig', {
        config: {name: 'dropboxAccessToken', value: '2'},
    }).resolves();

    adapter.saveAccessToken('2')
    .then(() => {
        t.equal(req.calledWith('utils/Url', 'navigate', {url: '/'}), true,
            'navigates to the "index" page');
        t.equal(adapter.configs.accessToken, '2', 'changes access token configs');

        sand.restore();
        t.end();
    });
});

test('components/dropbox/Adapter: find()', t => {
    const adapter = new Adapter(configs);
    const resp = {entries: [
        {name: '1.json', path_lower: '/1.json'}, {name: '2', path_lower: '/2'},
    ]};
    sand.stub(adapter, 'readDir').withArgs({path: '/default/notes'}).resolves(resp);
    sand.stub(adapter, 'readFile');

    adapter.find({profileId: 'default', type: 'notes'})
    .then(() => {
        t.equal(adapter.readFile.callCount, 1, 'reads only JSON files');
        t.equal(adapter.readFile.calledWith({path: '/1.json'}), true,
            'reads a JSON file');

        sand.restore();
        t.end();
    });
});

test('components/dropbox/Adapter: readDir()', t => {
    const adapter = new Adapter(configs);
    const res     = [{name: '1'}];
    sand.stub(adapter.dbx, 'filesListFolder').withArgs({
        path            : '/notes',
        include_deleted : false,
    }).resolves(res);

    adapter.readDir({path: '/notes'})
    .then(resp => {
        t.equal(resp, res);
        sand.restore();
        t.end();
    });
});

// @todo
test('components/dropbox/Adapter: readFile()', t => {
    const adapter = new Adapter(configs);
    const data    = {id: '1', title: 'Test'};

    // sand.stub(adapter.dbx, 'filesDownload').withArgs({path: '/notes/1.json'})
    // .resolves(data);

    // adapter.readFile({path: '/notes/1.json'})
    // .then(() => {
        sand.restore();
        t.end();
    // });
});

test('components/dropbox/Adapter: findModel()', t => {
    const adapter = new Adapter(configs);
    const read    = sand.stub(adapter, 'readFile');
    sand.stub(adapter, 'getModelPath').withArgs({id: '1'}).returns('/1.json');

    adapter.findModel({model: {}});
    t.equal(read.notCalled, true, 'does nothing if the model does not have ID');

    adapter.findModel({model: {id: '1'}});
    t.equal(read.calledWith({path: '/1.json'}), true, 'reads the file');

    sand.restore();
    t.end();
});

test('components/dropbox/Adapter: saveModel()', t => {
    const adapter = new Adapter(configs);
    const upload  = sand.stub(adapter.dbx, 'filesUpload');
    sand.stub(adapter, 'getModelPath').withArgs({id: '1'}).returns('/1.json');

    adapter.saveModel({model: {}});
    t.equal(upload.notCalled, true, 'does nothing if the model does not have ID');

    adapter.saveModel({model: {
        id: '1',
        getData: () => {return {}},
    }});
    t.equal(upload.called, true, 'saves the file on Dropbox');

    sand.restore();
    t.end();
});

test('components/dropbox/Adapter: getModelPath()', t => {
    const adapter = new Adapter(configs);
    const model = new Notes.prototype.model({id: '1'});

    t.equal(adapter.getModelPath(model, 'default'), '/default/notes/1.json');

    t.end();
});
