/*jshint expr: true*/
define([
    'sinon',
    'underscore',
    'q',
    'backbone.sync',
    'models/note',
    'collections/notes'
], function(sinon, _, Q, bSync, Model, Collection) {
    'use strict';

    describe('backbone.sync', function() {
        var sandbox,
            sync;

        before(function() {
            sync = _.clone(bSync);
        });

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('object', function() {

            it('is an object', function() {
                expect(sync).to.be.an('object');
            });

            it('stores promises', function() {
                expect(sync.promises).to.be.an('object');
            });

        });

        describe('.listenToWorker()', function() {

            after(function() {
                sync.workerPromise = null;
            });

            it('resolves the worker promise', function() {
                sync.workerPromise = {resolve: sandbox.stub()};
                sync.listenToWorker({data: {msg: 'ready'}});
                expect(sync.workerPromise.resolve).called;
            });

            it('resolves a request promise', function(done) {
                sync.promises['test-id'] = Q.defer();

                sync.promises['test-id'].promise.then(function(data) {
                    expect(data).to.be.equal('Data');
                    done();
                });

                sync.listenToWorker({data: {
                    msg: 'done', promiseId : 'test-id', data: 'Data'
                }});
            });

            it('rejects a failed WebWorker', function(done) {
                sync.promises['test-id'] = Q.defer();

                sync.promises['test-id'].promise.fail(function(data) {
                    expect(data).to.be.equal('Error');
                    done();
                });

                sync.listenToWorker({data: {
                    msg: 'fail', promiseId: 'test-id', data: 'Error'
                }});
            });

        });

        describe('.read()', function() {

            it('it calls .find() if the 1st argument is model', function() {
                sandbox.stub(sync, 'find');
                sync.read({id: 'test-id'}, {profile: '1'});
                expect(sync.find).calledWith({id: 'test-id'}, {profile: '1'});
            });

            it('it calls .findAll() if the 1st argument is not model', function() {
                sandbox.stub(sync, 'findAll');
                sync.read({models: [{id: 'test'}]}, {profile: '1'});
                expect(sync.findAll).calledWith({models: [{id: 'test'}]}, {profile: '1'});
            });

        });

        describe('.create()', function() {

            beforeEach(function() {
                sandbox.stub(sync, 'save');
            });

            it('calls .save()', function() {
                sync.create();
                expect(sync.save).called;
            });

            it('provides all arguments', function() {
                sync.create({id: 'test-id-1'}, {profile: '1'});
                expect(sync.save).calledWith({id: 'test-id-1'}, {profile: '1'});
            });

        });

        describe('.update()', function() {

            beforeEach(function() {
                sandbox.stub(sync, 'save');
            });

            it('calls .save()', function() {
                sync.update();
                expect(sync.save).called;
            });

            it('provides all arguments', function() {
                sync.update({id: 'test-id-1'}, {profile: '1'});
                expect(sync.save).calledWith({id: 'test-id-1'}, {profile: '1'});
            });

        });

        describe('.s4()', function() {

            it('returns a string', function() {
                expect(sync.s4()).to.be.a('string');
                expect(sync.s4()).to.have.property('length').equal(4);
            });

        });

        describe('.guid()', function() {

            it('returns a string', function() {
                expect(sync.guid()).to.be.a('string');
                expect(sync.guid()).to.have.property('length').equal((8 * 4) + 4);
            });

            it('calls .s4() 8 times', function() {
                sandbox.spy(sync, 's4');
                sync.guid();
                expect(sync.s4).callCount(8);
            });

        });

        describe('.save()', function() {
            var model;

            beforeEach(function() {
                model = new Model();
                sandbox.stub(sync, '_emit');
            });

            it('generates an ID for a model if does not have one', function() {
                sandbox.spy(sync, 'guid');
                sandbox.spy(model, 'set');

                sync.save(model, {});
                expect(sync.guid).called;
                expect(model.set).calledAfter(sync.guid);
            });

            it('calls ._emit()', function() {
                sync.save(model, {});
                expect(sync._emit).called;
            });

            it('tells ._emit() to trigger `save` message', function() {
                sync.save(model, {});
                expect(sync._emit).calledWithMatch('save', {});
            });

            it('provides data for saving', function() {
                model.set('title', 'Test title');
                sync.save(model, {profile: 'test'});

                expect(sync._emit).calledWithMatch('save', {
                    id      : model.id,
                    data    : model.toJSON(),
                    options : {
                        profile     : 'test',
                        storeName   : model.storeName,
                        encryptKeys : model.encryptKeys
                    }
                });
            });

        });

        describe('.find()', function() {
            var model;

            beforeEach(function() {
                model = new Model({id: 'test-id'});
                sandbox.stub(sync, '_emit').returns(Q.resolve({title: 'Test'}));
            });

            it('tells .emit() to trigger `find` message', function() {
                sync.find(model, {});

                expect(sync._emit).calledWithMatch('find');
                expect(sync._emit).calledWithMatch('find', {
                    id      : model.id,
                    options : {
                        profile   : model.profileId,
                        storeName : model.storeName
                    }
                });
            });

            it('changes the models attributes to fetched values', function() {
                sandbox.spy(model, 'set');
                return sync.find(model, {}).then(function() {
                    expect(model.set).calledWithMatch({title: 'Test'});
                });
            });

        });

        describe('.findAll()', function() {
            var coll;

            beforeEach(function() {
                coll = new Collection();
                sandbox.stub(sync, '_emit').returns(Q.resolve([{title: 'Test'}]));
            });

            it('tells ._emit() to trigger `findAll` message', function() {
                sync.findAll(coll, {conditions: {t: 1}});

                expect(sync._emit).calledWithMatch('findAll', {
                    options: {
                        conditions: {t: 1},
                        storeName : coll.storeName,
                        profile   : coll.profileId
                    }
                });
            });

            it('adds data to the collection', function() {
                sandbox.spy(coll, 'add');
                return sync.findAll(coll, {}).then(function() {
                    expect(coll.add).calledWithMatch([{title: 'Test'}]);
                });
            });

        });

        describe('._emit()', function() {

            after(function() {
                delete sync.worker;
            });

            beforeEach(function() {
                sync.promises = [];
                sandbox.stub(sync, 'guid').returns('test-worker-id');
                sync.worker = {postMessage: sandbox.stub()};
            });

            it('it generates an ID for the worker promise', function() {
                sync._emit('test', {});
                expect(sync.guid).called;
            });

            it('caches the worker promise', function() {
                expect(sync.promises['test-worker-id']).to.be.an('undefined');
                sync._emit('test', {});
                expect(sync.promises['test-worker-id']).to.be.an('object');
            });

            it('sends the message to the worker', function() {
                sync._emit('test', {data: {id: '1'}});

                expect(sync.worker.postMessage).calledWithMatch({
                    msg       : 'test',
                    data      : {data : {id : '1'}},
                    promiseId : 'test-worker-id'
                });
            });

            it('returns a promise', function() {
                expect(sync._emit('test', {})).to.have.property('promiseDispatch');
            });

        });

    });

});
