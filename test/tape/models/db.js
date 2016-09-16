/**
 * Test utils/Db.js
 * @file
 */
import test from 'tape';
import sinon from 'sinon';
import localforage from 'localforage';

import Db from '../../../app/scripts/utils/Db';

let sand;
const options = {profile: 'test', storeName: 'tests'};
test('Initializer: before()', t => {
    sand = sinon.sandbox.create();
    localStorage.clear();
    t.end();
});

test('Db: constructor()', t => {
    const db = new Db();
    t.equal(typeof db.dbs, 'object', 'creates dbs property');
    t.end();
});

test('Db: getDb()', t => {
    const db  = new Db();
    const spy = sand.spy(localforage, 'createInstance');

    const res = db.getDb({profile: 'test', storeName: 'tests'});
    t.equal(spy.calledWith({name: 'test', storeName: 'tests'}), true,
        'creates a new localforage instance');
    t.equal(typeof res, 'object', 'returns localforage instance');

    sand.restore();
    t.end();
});

test('Db: getDb() - old instance', t => {
    const db  = new Db();
    const spy = sand.spy(localforage, 'createInstance');
    const instance = {test: 1};
    db.dbs['test/tests'] = instance;

    const res = db.getDb({profile: 'test', storeName: 'tests'});
    t.equal(spy.notCalled, true, 'does not create a new instance');
    t.equal(res, instance, 'uses an existing instance');

    sand.restore();
    t.end();
});

test('Db: findItem()', t => {
    const db   = new Db();
    const stub = sand.stub().returns(Promise.resolve());
    sand.stub(db, 'getDb').returns({getItem: stub});

    const opt = Object.assign(options, {id: 'test-id'});
    const res = db.findItem(opt);

    t.equal(db.getDb.calledWith(opt), true, 'gets a localforage instance first');
    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(stub.called, true, 'msg');

    sand.restore();
    t.end();
});

test('Db: find()', t => {
    const db  = new Db();
    const spy = sand.spy(db, 'getDb');
    const opt = Object.assign(options, {});
    const res = db.find(opt);

    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(spy.calledWith(opt), true, 'gets a localforage instance');

    res.then(val => {
        t.equal(Array.isArray(val), true, 'resolves with an array');
        t.equal(val.length, 0, 'resolves with empty array');
        sand.restore();
        t.end();
    });
});

test('Db: save()', t => {
    const db  = new Db();
    const spy = sand.spy(db, 'getDb');
    const opt = Object.assign(options, {
        id        : 'test-id-1',
        data      : {title: 'Test id'},
    });

    const res = db.save(opt);

    t.equal(typeof res.then, 'function', 'returns a promise');
    t.equal(spy.calledWith(opt), true, 'gets a localforage instance');

    res.then(() => {
        sand.restore();
        t.end();
    });
});

test('Db: findItem() - can find', t => {
    const db   = new Db();
    const data = {title: 'Test id'};

    db.save(Object.assign(options, {data, id: '1'}))
    .then(() => db.findItem(Object.assign(options, {id: '1'})))
    .then(res => {
        t.equal(typeof res, 'object', 'resolves with an object');
        t.equal(res.title, data.title, 'has a title');
        t.equal(res.id, '1', 'has an ID');
        t.end();
    });
});

test('Db: find() - can find', t => {
    const db   = new Db();
    const data = {title: 'Test id'};

    db.save(Object.assign(options, {data, id: '1'}))
    .then(() => db.find(Object.assign(options, {})))
    .then(res => {
        t.equal(Array.isArray(res), true, 'resolves with an array');
        t.equal(res.length > 0, true, 'the array is not empty');
        t.end();
    });
});

test('Db: find() - filters the results', t => {
    const db   = new Db();
    const data = {title: 'Test id', isFav: true};

    Promise.all([
        db.save(Object.assign(options, {data, id: 'f1'})),
        db.save(Object.assign(options, {data, id: 'f2'})),
        db.save(Object.assign(options, {data: {}, id: 'f3'})),
    ])
    .then(() => db.find(Object.assign(options, {conditions: {isFav: true}})))
    .then(res => {
        t.equal(Array.isArray(res), true, 'resolves with an array');
        t.comment(`result length is: ${res.length}`);
        t.equal(res.length, 2, 'msg');

        t.equal(res[0].isFav, true, 'the first item has isFav === true');
        t.equal(res[1].isFav, true, 'the second item has isFav === true');

        t.end();
    });
});

test('Db: after()', t => {
    localStorage.clear();
    t.end();
});
