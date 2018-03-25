/**
 * Test: components/importExport/migrate/Controller.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import Radio from 'backbone.radio';
import _ from '../../../../../app/scripts/utils/underscore';
import localforage from 'localforage';

// eslint-disable-next-line
const Controller = require('../../../../../app/scripts/components/importExport/migrate/Controller').default;
// eslint-disable-next-line
const Encryption = require('../../../../../app/scripts/components/importExport/migrate/Encryption').default;

let sand;
test('importExport/migrate/Controller: before()', t => {
    sand = sinon.sandbox.create();
    t.end();
});

test('importExport/migrate/Controller: init()', t => {
    const con = new Controller();
    sand.stub(con, 'check');

    const res = con.init();
    t.equal(typeof con.promise, 'object', 'creates "promise" property');
    con.promise.resolve();

    t.equal(typeof res.then, 'function', 'returns a promise');
    res.then(() => {
        t.equal(con.check.called, true, 'checks if migration is needed');
        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Controller: check()', t => {
    const con   = new Controller();
    con.promise = {resolve: sand.stub()};
    sand.stub(con, 'requiresMigration').resolves(false);
    sand.stub(con, 'destroy');
    const conf = [{name: 'encrypt'}];
    sand.stub(con, 'findOldData').withArgs('configs').resolves(conf);
    sand.stub(con, 'show');

    con.check()
    .then(() => {
        t.equal(con.promise.resolve.called, true, 'resolves the promise');
        t.equal(con.destroy.called, true, 'destroy itself');

        con.requiresMigration.resolves(true);
        return con.check();
    })
    .then(() => {
        t.equal(con.show.calledWith(conf), true, 'renders the view');
        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Controller: requiresMigration()', t => {
    const con  = new Controller();
    const req  = sand.stub(Radio, 'request').resolves([{id: '1'}]);
    const find = sand.stub(con, 'findOldData').resolves([{id: '1'}]);

    con.requiresMigration()
    .then(res => {
        t.equal(res, false, 'returns "false" if the new database is not empty');

        req.resolves([]);
        return con.requiresMigration();
    })
    .then(res => {
        t.equal(res, true, 'returns "true" if the new database is empty');

        find.resolves([]);
        return con.requiresMigration();
    })
    .then(res => {
        t.equal(res, false, 'returns "false" if the old database is also empty');
        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Controller: findOldData()', t => {
    const con  = new Controller();
    const stub = sand.spy(localforage, 'createInstance');

    con.findOldData()
    .then(models => {
        t.equal(stub.calledWith({storeName: 'notes', name: 'notes-db'}), true,
            'uses "notes" store name by default');
        t.equal(Array.isArray(models), true, 'resolves with an array');

        return con.findOldData('notebooks');
    })
    .then(() => {
        t.equal(stub.calledWith({storeName: 'notebooks', name: 'notes-db'}), true,
            'uses "storeName" argument');

        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Controller: show()', t => {
    const con    = new Controller();
    const req    = sand.stub(Radio, 'request');
    const listen = sand.stub(con, 'listenTo');
    const conf   = [
        {name: 'encrypt'     , value: '1'},
        {name: 'encryptPass' , value: '123'},
    ];

    con.show(conf);
    t.equal(typeof con.configs, 'object', 'creates "configs" property');
    t.equal(con.configs.encrypt, 1, 'converts "encrypt" config to number');

    t.equal(req.calledWith('Layout', 'show', {
        region : 'brand',
        view   : con.view,
    }), true, 'renders the view');

    t.equal(listen.calledWith(con.view, 'cancel', con.cancelMigration), true,
        'listens to "cancel" event');
    t.equal(listen.calledWith(con.view, 'start', con.startMigration), true,
        'listens to "start" event');

    sand.restore();
    t.end();
});

test('importExport/migrate/Controller: startMigration()', t => {
    const con     = new Controller();
    const auth    = sand.stub(Encryption.prototype, 'auth').resolves(false);
    con.view      = {
        ui            : {password: {val: () => '1'}},
        triggerMethod : sand.stub(),
    };
    const migrate = sand.stub(con, 'migrateCollections');
    con.configs   = {encrypt: 0};

    con.startMigration()
    .then(() => {
        t.equal(auth.notCalled, true,
            'does not try to authenticate if encryption is disabled');
        t.equal(migrate.called, true, 'starts migrating collections');

        con.configs.encrypt = 1;
        return con.startMigration();
    })
    .then(() => {
        t.equal(auth.calledWith({password: '1'}), true, 'tries to authenticate');
        t.equal(con.view.triggerMethod.calledWith('auth:failure'), true,
            'triggers "auth:failure"');
        t.equal(migrate.callCount, 1, 'does not migrate anything if auth failed');

        auth.resolves(true);
        migrate.rejects();
        return con.startMigration();
    })
    .then(() => {
        t.equal(con.view.triggerMethod.calledWith('migrate:failure'), true,
            'triggers "migrate:failure"');

        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Controller: cancelMigration()', t => {
    const con   = new Controller();
    con.promise = {resolve: sand.stub()};
    sand.stub(con, 'destroy');

    con.cancelMigration();
    t.equal(con.promise.resolve.called, true, 'resolves the promise');
    t.equal(con.destroy.called, true, 'destroy itself');

    sand.restore();
    t.end();
});

test('importExport/migrate/Controller: migrateCollections()', t => {
    const con   = new Controller();
    const trig  = sand.stub();
    con.view    = {triggerMethod: trig};
    con.promise = {resolve: sand.stub()};
    sand.stub(con, 'findOldData').resolves([]);
    sand.stub(con, 'destroy');
    sand.stub(con, 'migrateCollection');

    con.migrateCollections()
    .then(() => {
        t.equal(trig.calledWith('migrate:start'), true, 'triggers migrate:start');
        t.equal(trig.calledWith('migrate:collection'), true,
            'triggers migrate:collection');
        t.equal(trig.callCount, 5, 'triggers events for all collections');

        t.equal(con.migrateCollection.callCount, 4, 'migrates all collections');
        t.equal(con.promise.resolve.called, true, 'resolves the promise');
        t.equal(con.destroy.called, true, 'destroy itself');

        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Controller: migrateCollection()', t => {
    const con     = new Controller();
    const data    = [{id: 1}, {id: 2}];
    const migrate = sand.stub(con, 'migrateModel').resolves();

    con.migrateCollection(data)
    .then(() => {
        t.equal(migrate.calledWith({attributes: {id: 1}}), true,
            'migrates the first model');
        t.equal(migrate.calledWith({attributes: {id: 2}}), true,
            'migrates the second model');

        sand.restore();
        t.end();
    });
});

test('importExport/migrate/Controller: migrateModel()', t => {
    const con        = new Controller();
    const req        = sand.stub(Radio, 'request').resolves();
    const attributes = {id: '1', encryptedData: '1234', type: 'notes'};
    con.encrypt      = new Encryption({encrypt: 1});
    const decrypt    = sand.stub(con.encrypt, 'decryptModel').resolves(attributes);

    const res = con.migrateModel({attributes})
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(decrypt.calledWith({attributes}), true, 'decrypts the attributes');

    t.equal(req.calledWith('collections/Notes', 'saveModelObject'), true,'saves the model');

    sand.restore();
    t.end();
});
