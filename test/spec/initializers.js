/*jshint expr: true*/
/* global define, describe, it, expect, after */
define([
    'sinon',
    'underscore',
    'backbone.radio',
    'initializers'
], function(sinon, _, Radio, init) {
    'use strict';

    describe('initializers', function() {

        after(function() {
            init._inits = {};
            Radio.stopReplying('init', 'add', 'start');
            init.destroy();
        });

        describe('Object', function() {

            it('initializes itself automatically', function() {
                expect(init).to.be.an('object');
            });

            it('has `_inits` variable', function() {
                expect(init).to.have.property('_inits');
                expect(init._inits).to.be.an('object');
            });

        });

        describe('.addInit()', function() {

            it('adds a new initializer', function() {
                init.addInit('test', function() {});
                expect(init._inits).to.have.property('test');
                expect(init._inits.test).to.have.lengthOf(1);
            });

            it('pushes initializers to the existing key', function() {
                init.addInit('test', function() {});
                init.addInit('test', function() {});

                expect(init._inits.test).to.have.lengthOf(3);
            });

        });

        describe('.executeInits()', function() {

            it('returns a function', function() {
                expect(init.executeInits('test')).to.be.a('function');
            });

            it('the function returns a promise', function() {
                var res = init.executeInits('test')();
                expect(res).to.be.an('object');
                expect(res).to.have.property('promiseDispatch');
            });

            it('can execute several initializers', function() {
                var spy = sinon.spy();

                init.addInit('test1', spy);
                init.addInit('test2', spy);

                return init.executeInits('test1 test2')()
                .then(function() {
                    expect(spy).to.have.been.calledTwice;
                });
            });

        });

        describe('._executeInit()', function() {

            it('returns a promise', function() {
                expect(init._executeInit('test')).to.have.property('promiseDispatch');
            });

            it('can execute several functions in an initializer', function(done) {
                var spy = sinon.spy();

                init.addInit('testInit', spy);
                init.addInit('testInit', spy);

                return init._executeInit('testInit')
                .then(function() {
                    expect(spy).to.have.been.calledTwice;
                    done();
                });
            });

            it('passes arguments to an initializer function', function() {
                var spy = sinon.spy();
                init.addInit('testInitArg', spy);

                return init._executeInit('testInitArg', ['hello', 'world'])
                .then(function() {
                    spy.should.have.been.calledWith('hello', 'world');
                });
            });

        });

        describe('Replies', function() {

            it('`add`', function() {
                Radio.request('init', 'add', 'testReply', function() {});
                expect(init._inits).to.have.property('testReply');
            });

            it('`start`', function(done) {
                Radio.request('init', 'add', 'testRStart', function() { done(); });
                Radio.request('init', 'start', 'testRStart')();
            });

        });

    });

});
