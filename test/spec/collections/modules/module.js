/*jshint expr: true*/
/* global expect, define, describe, before, beforeEach, after, afterEach, it */
define([
    'sinon',
    'q',
    'underscore',
    'backbone.radio',
    'collections/modules/module',
    'collections/notes'
], function(sinon, Q, _, Radio, Module, Collection) {
    'use strict';

    describe('collections/modules/module', function() {
        var col,
            models,
            collection,
            sandbox,
            itStub;

        before(function() {
            Module.prototype.Collection = Collection;
            col = new Module();

            models = [];
            for (var i = 0; i < 10; i++) {
                models.push({id: 'id-' + i});
            }
            collection = new col.Collection(models);
            col.collection = collection.clone();
        });

        after(function() {
            col.destroy();
        });

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            itStub  = sandbox.stub();
        });

        afterEach(function() {
            sandbox.restore();
        });

        describe('.initialize()', function() {

            it('the default database is `notes-db`', function() {
                expect(col.defaultDB).to.be.equal('notes-db');
            });

            it('listens on `.Collection.storeName` channel', function() {
                expect(col.vent).to.be.an('object');
                expect(col.vent.channelName).to.be.equal(col.Collection.prototype.storeName);
            });

            it('listens to requests', function() {
                var keys = _.keys(col.vent._requests);
                _.each(col.reply(), function(reply, key) {
                    expect(keys).to.contain(key);
                });
            });

            it('listens to `destroy:collection` event', function() {
                expect(_.keys(col.vent._events)).to.be.contain('destroy:collection');
            });

        });

        describe('.changeDatabase', function() {

            after(function() {
                col.changeDatabase(col.defaultDB);
            });

            it('changes profileId of a collection', function() {
                expect(col.changeDatabase({profile: 'test'}).prototype.profileId).to.be.equal('test');
            });

            it('changes profileId of a model', function() {
                expect(col.changeDatabase({profile: 'test1'}).prototype.model.prototype.profileId)
                    .to.be.equal('test1');
            });

        });

        describe('.onReset()', function() {

            beforeEach(function() {
                col.collection = collection.clone();
            });

            it('resets the collection', function(done) {
                col.collection.once('reset', function() { done(); });
                col.onReset();
            });

            it('calls collection.removeEvents() if it exists', function() {
                var stub = sandbox.stub(col.collection, 'removeEvents');
                col.onReset();
                expect(stub).called;
            });

        });

        describe('.save()', function() {
            var model;

            before(function() {
                model = collection.at(0).clone();
            });

            beforeEach(function() {
                sandbox.stub(col, 'encryptModel').returns(model);
                sandbox.stub(model, 'save');
            });

            it('triggers `invalid` event if validation fails', function() {
                model.once('invalid', itStub);

                col.save(model, {title: ''});
                expect(itStub).calledWithMatch(model, ['title']);
            });

            it('rejects the promise if validation fails', function() {
                return col.save(model, {title: ''}).should.eventually.be.rejected;
            });

            it('calls model.setEscape() if it exists', function() {
                sandbox.spy(model, 'setEscape');

                col.save(model, {title: 'Hello', content: 'World'});
                expect(model.setEscape).calledWith({title: 'Hello', content: 'World'});
            });

            it('encrypts the model before saving', function() {
                col.save(model, {title: 'Hello', content: 'World'});
                expect(col.encryptModel).called;
            });

            it('saves the model', function() {
                return col.save(model, {title: 'hello'}).then(function() {
                    expect(model.save).calledWithMatch({title: 'hello'}, {validate: false});
                });
            });

        });

        describe('.saveModel()', function() {
            var model;

            before(function() {
                model = new col.Collection.prototype.model();
            });

            beforeEach(function() {
                sandbox.stub(col, 'save', function(m, data) {
                    m.set(data);
                    return Q.resolve(m);
                });

                sandbox.stub(col, 'decryptModel').returns(model);
            });

            it('changes dates of model', function() {
                expect(model.attributes.updated).to.be.equal(0);
                expect(model.attributes.created).to.be.equal(0);

                return col.saveModel(model, {title: 'Test'}).then(function() {
                    expect(model.attributes.updated).not.to.be.equal(0);
                    expect(model.attributes.created).not.to.be.equal(0);
                });
            });

            it('triggers `sync:model` event', function() {
                col.vent.once('sync:model', itStub);

                return col.saveModel(model, {title: 'Test'}).then(function() {
                    expect(itStub).calledWith(model);
                });
            });

            it('triggers `update:model` event', function() {
                col.vent.once('update:model', itStub);

                return col.saveModel(model, {title: 'Test'}).then(function() {
                    expect(itStub).calledWith(model);
                });
            });

        });

        describe('.saveCollection()', function() {

            before(function() {
                col.collection = collection.clone();
            });

            beforeEach(function() {
                sandbox.stub(Q, 'invoke').returns(Q.resolve());
            });

            it('saves all changes in a collection', function() {
                col.saveCollection();
                expect(Q.invoke).callCount(col.collection.length);
                expect(Q.invoke).calledWithMatch({}, 'save', {trash: 0});
            });

            it('triggers `saved:collection` event', function() {
                col.vent.once('saved:collection', itStub);

                return col.saveCollection().then(function() {
                    expect(itStub).called;
                });
            });

        });

        describe('.saveRaw()', function() {
            var model;

            before(function() {
                model = new col.collection.model({id: 'test-1', title: 'Test'});
            });

            beforeEach(function() {
                sandbox.stub(col, 'decryptModel').returns(Q.resolve(model));
                sandbox.stub(col, 'save').returns(Q.resolve(model));
            });

            it('instantiates a model with the provided profileId', function() {
                sandbox.spy(col, 'changeDatabase');
                col.saveRaw({id: 'test-1', title: 'Test'}, {profile: 'test-db'});
                expect(col.changeDatabase).calledWith({profile: 'test-db'});
            });

            it('decrypts data before saving', function() {
                col.saveRaw({id: 'test-1', title: 'Test'});
                expect(col.decryptModel).calledBefore(col.save);
                expect(col.decryptModel).calledWithMatch({id: 'test-1', attributes: {title: 'Test'}});
            });

            it('validates data before saving', function() {
                var spy = sandbox.spy(col.Collection.prototype.model.prototype, 'validate');

                return col.saveRaw({id: 'test-1', title: 'Test'}).then(function() {
                    expect(spy).calledBefore(col.save);
                });
            });

            it('saves data', function() {
                return col.saveRaw({id: 'test-1', title: 'Test'}).then(function() {
                    expect(col.save).calledWithMatch({id: 'test-1'}, {id: 'test-1', title: 'Test'});
                });
            });

            it('triggers `update:model` and `synced:ID` after saving', function() {
                var stub = sandbox.stub();
                col.vent.once('synced:test-1', stub);
                col.vent.once('update:model', itStub);

                return col.saveRaw({id: 'test-1', title: 'Test'}).then(function() {
                    expect(itStub).calledWithMatch({id: 'test-1'});
                    expect(stub).calledWithMatch({id: 'test-1'});
                });
            });

        });

        describe('.saveAllRaw()', function() {

            beforeEach(function() {
                sandbox.stub(col, 'saveRaw').returns(Q.resolve());
            });

            it('saves all data', function() {
                return col.saveAllRaw(models, {profile: 'test-db'}).then(function() {
                    expect(col.saveRaw).callCount(models.length);
                    expect(col.saveRaw).calledWithMatch({}, {profile: 'test-db'});
                });
            });

        });

        describe('.remove()', function() {

            beforeEach(function() {
                sandbox.stub(col, 'save').returns(Q.resolve());
            });

            it('changes a model\'s `trash` status to `2`', function() {
                var spy = sandbox.spy(col.collection.model.prototype, 'set');
                col.remove({id: 'test-1'}, {});
                expect(spy).calledWithMatch({trash: 2});
            });

            it('changes a model\'s atributes to default values', function() {
                var defaults = _.omit(col.collection.model.prototype.attributes, 'id', 'trash', 'updated');
                defaults     = _.extend(defaults, {trash: 2});

                return col.remove({id: 'test-1'}, {}).then(function() {
                    expect(col.save).calledWithMatch({id: 'test-1'}, defaults);
                });
            });

            it('triggers `destroy:model` event', function() {
                col.vent.once('destroy:model', itStub);

                return col.remove({id: 'test-1'}, {}).then(function() {
                    expect(itStub).calledAfter(col.save);
                });
            });

        });

        describe('.getModel()', function() {

            before(function() {
                col.collection.add({id: 'test-1'});
            });

            beforeEach(function() {
                sandbox.stub(col.collection.model.prototype, 'fetch').returns(Q.resolve());
                sandbox.stub(col, 'decryptModel').returns(Q.resolve());
            });

            it('returns a new model with default values if ID was not provided', function() {
                return col.getModel({}).should.eventually.contain({id: undefined});
            });

            it('returns model from cache if it is there', function() {
                return col.getModel({id: 'test-1'}).should.eventually
                    .contain({id: 'test-1'}, {profileId: col.defaultDB});
            });

            it('fetches from database if profileId of a model is different from collection\'s', function() {
                return col.getModel({id: 'test-1', profile: 'test-db'})
                .then(function() {
                    expect(col.collection.model.prototype.fetch).called;
                });
            });

            it('returns null if if fetch rejects with `not found` error', function() {
                col.collection.model.prototype.fetch.returns(Q.reject('not found'));
                return col.getModel({id: 'test-1', profile: 'test-db'}).should.eventually
                    .be.equal(null);
            });

        });

        describe('.getAll()', function() {

            beforeEach(function() {
                sandbox.stub(col, 'fetch').returns(Q.resolve(collection));
            });

            it('triggers `destroy:collection`', function() {
                col.vent.once('destroy:collection', itStub);
                col.getAll({});
                expect(itStub).called;
            });

            it('calls .fetch()', function() {
                col.getAll({profile: 'test-db'});
                expect(col.fetch).calledWith({profile: 'test-db'});
            });

            it('provides filter conditions', function() {
                col.getAll({profile: 'test-db', filter: 'active'});

                expect(col.fetch).calledWithMatch({
                    profile    : 'test-db',
                    conditions : col.Collection.prototype.conditions.active
                });
            });

            it('caches collection locally', function() {
                return col.getAll({profile: 'test-db', filter: 'active'})
                .then(function() {
                    expect(col.collection).to.be.equal(collection);
                    expect(col.collection.conditionFilter).to.be.equal('active');
                    expect(col.collection.conditionCurrent)
                        .to.be.equal(col.Collection.prototype.conditions.active);
                });
            });

            it('calls .registerEvents() if it exist in a collection', function() {
                sandbox.stub(col.collection, 'registerEvents');
                return col.getAll({}).then(function() {
                    expect(col.collection.registerEvents).called;
                });
            });

        });

        describe('.fetch()', function() {

            beforeEach(function() {
                sandbox.stub(col, 'decryptModels').returns(Q.resolve());
                sandbox.stub(col.Collection.prototype, 'fetch').returns(Q.resolve());
            });

            it('changes profileId before fetching', function() {
                sandbox.spy(col, 'changeDatabase');
                col.fetch({profile: 'test'});

                expect(col.changeDatabase).calledWith({profile: 'test'});
                expect(col.changeDatabase).calledBefore(col.Collection.prototype.fetch);
            });

            it('calls collection\'s .fetch() function', function() {
                col.fetch({profile: 'test'});
                expect(col.Collection.prototype.fetch).calledWith({profile: 'test'});
            });

            it('returns in decrypted format if `encrypt` option is false', function() {
                return col.fetch({profile: 'test'}).then(function() {
                    expect(col.decryptModels).called;
                });
            });

        });

        describe('._isEncryptEnabled()', function() {
            var configs,
                model;

            before(function() {
                configs = {encrypt: 0, encryptBackup: {}};
                Radio.reply('configs', 'get:object', function() { return configs; });
            });

            beforeEach(function() {
                model = new col.Collection.prototype.model();
            });

            after(function() {
                Radio.stopReplying('configs', 'get:object');
            });

            it('returns false if a collection store name is configs', function() {
                col.Collection.prototype.storeName = 'configs';
                expect(col._isEncryptEnabled()).to.be.equal(false);
                col.Collection.prototype.storeName = 'notes';
            });

            it('returns false if encryption is disabled', function() {
                expect(col._isEncryptEnabled(model)).to.be.equal(false);
            });

            it('returns false if a model does not have encryptKeys', function() {
                model.encryptKeys = undefined;
                expect(col._isEncryptEnabled(model)).to.be.equal(false);
            });

            it('returns true', function() {
                configs.encrypt = 1;
                expect(col._isEncryptEnabled(col.collection.model.prototype)).to.be.equal(true);
            });

        });

        describe('.encryptModel()', function() {

            beforeEach(function() {
                sandbox.stub(col, '_isEncryptEnabled').returns(false);
            });

            it('does nothing if encryption is disabled', function() {
                return col.encryptModel({clear: true}).should.eventually
                    .deep.equal({clear: true});
            });

            it('encrypts if encryption is enabled', function() {
                col._isEncryptEnabled.returns(true);
                Radio.replyOnce('encrypt', 'encrypt:model', itStub);

                col.encryptModel({clear: true});
                expect(itStub).calledWith({clear: true});
            });

        });

        describe('.decryptModel()', function() {

            beforeEach(function() {
                sandbox.stub(col, '_isEncryptEnabled').returns(false);
            });

            it('does nothing if encryption is disabled', function() {
                return col.decryptModel({clear: true}).should.eventually
                    .deep.equal({clear: true});
            });

            it('encrypts if encryption is enabled', function() {
                col._isEncryptEnabled.returns(true);
                Radio.replyOnce('encrypt', 'decrypt:model', itStub);

                col.decryptModel({clear: true});
                expect(itStub).calledWith({clear: true});
            });

        });

        describe('.decryptModels()', function() {

            beforeEach(function() {
                sandbox.stub(col, '_isEncryptEnabled').returns(false);
            });

            it('checks if encryption is enabled', function() {
                col.decryptModels();
                expect(col._isEncryptEnabled).calledWith(col.collection.model.prototype);
            });

            it('does nothing if encryption is disabled', function() {
                return col.decryptModels().should.eventually
                    .be.equal(col.collection);
            });

            it('decrypts models if encryption is enabled', function() {
                col._isEncryptEnabled.returns(true);
                Radio.replyOnce('encrypt', 'decrypt:models', itStub);

                col.decryptModels();
                expect(itStub).calledWith(col.collection);
            });

        });

    });

});

